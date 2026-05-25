from calendar import month_name
from datetime import datetime
from decimal import Decimal
from html import escape
from io import BytesIO

from django.db import transaction
from django.http import HttpResponse
from django.utils import timezone

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
)

from rest_framework import generics, permissions, status
from rest_framework.exceptions import PermissionDenied, NotFound
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Order
from .serializers import (
    AdminOrderStatusUpdateSerializer,
    OrderCreateSerializer,
    OrderListSerializer,
)


def get_delivery_charge(product_subtotal):
    """
    Delivery rule:
    - More than BDT 2000 = free delivery
    - BDT 2000 or below = BDT 120 delivery charge
    """
    product_subtotal = Decimal(str(product_subtotal))

    if product_subtotal > Decimal("2000.00"):
        return Decimal("0.00")

    return Decimal("120.00")


class OrderCreateView(generics.CreateAPIView):
    serializer_class = OrderCreateSerializer
    permission_classes = [permissions.IsAuthenticated]


class MyOrderListView(generics.ListAPIView):
    serializer_class = OrderListSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return (
            Order.objects.filter(user=self.request.user)
            .prefetch_related("items")
            .order_by("-created_at")
        )


class MyOrderCancelView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        cancellable_statuses = ["pending", "processing"]

        with transaction.atomic():
            try:
                order = (
                    Order.objects.select_for_update()
                    .prefetch_related("items__product")
                    .get(pk=pk, user=request.user)
                )
            except Order.DoesNotExist:
                raise NotFound("Order not found.")

            if order.status not in cancellable_statuses:
                return Response(
                    {
                        "detail": "This order cannot be cancelled now. Only pending or processing orders can be cancelled."
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            for item in order.items.all():
                if item.product:
                    item.product.stock += item.quantity
                    item.product.save(update_fields=["stock"])

            order.status = "cancelled"
            order.save(update_fields=["status", "updated_at"])

        serializer = OrderListSerializer(order)
        return Response(serializer.data, status=status.HTTP_200_OK)


class AdminOrderListView(generics.ListAPIView):
    queryset = Order.objects.all().prefetch_related("items")
    serializer_class = OrderListSerializer
    permission_classes = [permissions.IsAdminUser]


class AdminOrderStatusUpdateView(generics.UpdateAPIView):
    queryset = Order.objects.all()
    serializer_class = AdminOrderStatusUpdateSerializer
    permission_classes = [permissions.IsAdminUser]


class OrderPayslipDownloadView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_order(self, request, pk):
        try:
            order = Order.objects.prefetch_related("items").get(pk=pk)
        except Order.DoesNotExist:
            raise NotFound("Order not found.")

        if not request.user.is_staff and order.user_id != request.user.id:
            raise PermissionDenied("You are not allowed to download this payslip.")

        return order

    def get(self, request, pk):
        order = self.get_order(request, pk)

        product_subtotal = Decimal(str(order.total_amount))
        delivery_charge = get_delivery_charge(product_subtotal)
        grand_total = product_subtotal + delivery_charge

        buffer = BytesIO()

        doc = SimpleDocTemplate(
            buffer,
            pagesize=A4,
            rightMargin=35,
            leftMargin=35,
            topMargin=35,
            bottomMargin=35,
        )

        styles = getSampleStyleSheet()
        elements = []

        title = "SARN - Order Payslip"
        elements.append(Paragraph(title, styles["Title"]))
        elements.append(Spacer(1, 8))

        subtitle = "SARN - Shop Authentic Refined Network"
        elements.append(Paragraph(subtitle, styles["Normal"]))
        elements.append(Spacer(1, 18))

        order_date = timezone.localtime(order.created_at).strftime(
            "%Y-%m-%d %I:%M %p"
        )

        order_info = f"""
        <b>Order ID:</b> #{order.id}<br/>
        <b>Order Date:</b> {order_date}<br/>
        <b>Payment Method:</b> {escape(order.get_payment_method_display())}<br/>
        """
        elements.append(Paragraph(order_info, styles["Normal"]))
        elements.append(Spacer(1, 14))

        customer_info = f"""
        <b>Customer Name:</b> {escape(order.full_name)}<br/>
        <b>Email:</b> {escape(order.email)}<br/>
        <b>Phone:</b> {escape(order.phone)}<br/>
        <b>City:</b> {escape(order.city)}<br/>
        <b>Address:</b> {escape(order.address)}<br/>
        """
        elements.append(Paragraph(customer_info, styles["Normal"]))
        elements.append(Spacer(1, 18))

        table_data = [
            [
                "Product",
                "Unit Price",
                "Quantity",
                "Subtotal",
            ]
        ]

        for item in order.items.all():
            table_data.append(
                [
                    escape(item.product_name),
                    f"BDT {item.price}",
                    str(item.quantity),
                    f"BDT {item.subtotal}",
                ]
            )

        table_data.append(
            [
                "",
                "",
                "Product Subtotal",
                f"BDT {product_subtotal}",
            ]
        )

        table_data.append(
            [
                "",
                "",
                "Delivery Charge",
                "FREE"
                if delivery_charge == Decimal("0.00")
                else f"BDT {delivery_charge}",
            ]
        )

        table_data.append(
            [
                "",
                "",
                "Grand Total",
                f"BDT {grand_total}",
            ]
        )

        table = Table(
            table_data,
            colWidths=[230, 100, 90, 100],
        )

        table.setStyle(
            TableStyle(
                [
                    ("BACKGROUND", (0, 0), (-1, 0), colors.lightgrey),
                    ("TEXTCOLOR", (0, 0), (-1, 0), colors.black),
                    ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                    ("ALIGN", (1, 1), (-1, -1), "CENTER"),
                    ("ALIGN", (0, 0), (0, -1), "LEFT"),
                    ("GRID", (0, 0), (-1, -1), 0.5, colors.black),
                    ("FONTSIZE", (0, 0), (-1, -1), 9),
                    ("BOTTOMPADDING", (0, 0), (-1, 0), 8),
                    ("FONTNAME", (2, -3), (-1, -1), "Helvetica-Bold"),
                    ("BACKGROUND", (2, -3), (-1, -1), colors.whitesmoke),
                    ("BACKGROUND", (2, -1), (-1, -1), colors.lightgrey),
                    ("FONTSIZE", (2, -1), (-1, -1), 10),
                ]
            )
        )

        elements.append(table)
        elements.append(Spacer(1, 20))

        note = """
        <b>Note:</b> This payslip is generated for order confirmation and record keeping.
        Delivery charge is free for orders above BDT 2000; otherwise, BDT 120 is added.
        """
        elements.append(Paragraph(note, styles["Normal"]))

        doc.build(elements)

        buffer.seek(0)

        filename = f"sarn-order-payslip-{order.id}.pdf"

        response = HttpResponse(buffer, content_type="application/pdf")
        response["Content-Disposition"] = f'attachment; filename="{filename}"'

        return response


class AdminMonthlySalesReportView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        today = timezone.now()

        try:
            year = int(request.GET.get("year", today.year))
            month = int(request.GET.get("month", today.month))

            if month < 1 or month > 12:
                month = today.month

        except ValueError:
            year = today.year
            month = today.month

        orders = Order.objects.filter(
            status=Order.STATUS_DELIVERED,
            created_at__year=year,
            created_at__month=month,
        ).order_by("created_at")

        total_product_sales = sum(
            Decimal(str(order.total_amount)) for order in orders
        )

        total_delivery_charge = sum(
            get_delivery_charge(order.total_amount) for order in orders
        )

        total_sales = total_product_sales + total_delivery_charge
        total_orders = orders.count()

        buffer = BytesIO()

        doc = SimpleDocTemplate(
            buffer,
            pagesize=landscape(A4),
            rightMargin=30,
            leftMargin=30,
            topMargin=30,
            bottomMargin=30,
        )

        styles = getSampleStyleSheet()
        elements = []

        title = f"SARN Monthly Sales Report - {month_name[month]} {year}"
        elements.append(Paragraph(title, styles["Title"]))
        elements.append(Spacer(1, 12))

        summary = f"""
        <b>Total Delivered Orders:</b> {total_orders}<br/>
        <b>Total Product Sales:</b> BDT {total_product_sales}<br/>
        <b>Total Delivery Charges:</b> BDT {total_delivery_charge}<br/>
        <b>Grand Total Sales:</b> BDT {total_sales}
        """
        elements.append(Paragraph(summary, styles["Normal"]))
        elements.append(Spacer(1, 18))

        table_data = [
            [
                "Order ID",
                "Customer",
                "Email",
                "Phone",
                "City",
                "Payment",
                "Date",
                "Subtotal",
                "Delivery",
                "Grand Total",
            ]
        ]

        for order in orders:
            product_subtotal = Decimal(str(order.total_amount))
            delivery_charge = get_delivery_charge(product_subtotal)
            grand_total = product_subtotal + delivery_charge

            table_data.append(
                [
                    f"#{order.id}",
                    order.full_name,
                    order.email,
                    order.phone,
                    order.city,
                    order.payment_method.replace("_", " ").title(),
                    timezone.localtime(order.created_at).strftime("%Y-%m-%d"),
                    f"BDT {product_subtotal}",
                    "FREE"
                    if delivery_charge == Decimal("0.00")
                    else f"BDT {delivery_charge}",
                    f"BDT {grand_total}",
                ]
            )

        if total_orders == 0:
            table_data.append(
                [
                    "-",
                    "No delivered orders found",
                    "-",
                    "-",
                    "-",
                    "-",
                    "-",
                    "-",
                    "-",
                    "-",
                ]
            )

        table = Table(
            table_data,
            colWidths=[55, 100, 130, 80, 70, 100, 75, 80, 75, 85],
        )

        table.setStyle(
            TableStyle(
                [
                    ("BACKGROUND", (0, 0), (-1, 0), colors.lightgrey),
                    ("TEXTCOLOR", (0, 0), (-1, 0), colors.black),
                    ("ALIGN", (0, 0), (-1, -1), "CENTER"),
                    ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                    ("FONTSIZE", (0, 0), (-1, -1), 7),
                    ("BOTTOMPADDING", (0, 0), (-1, 0), 8),
                    ("GRID", (0, 0), (-1, -1), 0.5, colors.black),
                ]
            )
        )

        elements.append(table)
        doc.build(elements)

        buffer.seek(0)

        filename = f"sarn-monthly-sales-report-{year}-{month:02d}.pdf"

        response = HttpResponse(buffer, content_type="application/pdf")
        response["Content-Disposition"] = f'attachment; filename="{filename}"'

        return response


class AdminDateWiseSalesReportView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        start_date_text = request.GET.get("start_date")
        end_date_text = request.GET.get("end_date")

        if not start_date_text or not end_date_text:
            return Response(
                {"detail": "start_date and end_date are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            start_date = datetime.strptime(start_date_text, "%Y-%m-%d").date()
            end_date = datetime.strptime(end_date_text, "%Y-%m-%d").date()
        except ValueError:
            return Response(
                {"detail": "Invalid date format. Use YYYY-MM-DD."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if start_date > end_date:
            return Response(
                {"detail": "Start date cannot be after end date."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        orders = Order.objects.filter(
            status=Order.STATUS_DELIVERED,
            created_at__date__gte=start_date,
            created_at__date__lte=end_date,
        ).order_by("created_at")

        total_product_sales = sum(
            Decimal(str(order.total_amount)) for order in orders
        )

        total_delivery_charge = sum(
            get_delivery_charge(order.total_amount) for order in orders
        )

        total_sales = total_product_sales + total_delivery_charge
        total_orders = orders.count()

        buffer = BytesIO()

        doc = SimpleDocTemplate(
            buffer,
            pagesize=landscape(A4),
            rightMargin=30,
            leftMargin=30,
            topMargin=30,
            bottomMargin=30,
        )

        styles = getSampleStyleSheet()
        elements = []

        title = "SARN Date-wise Sales Report"
        elements.append(Paragraph(title, styles["Title"]))
        elements.append(Spacer(1, 8))

        period = f"<b>Report Period:</b> {start_date} to {end_date}"
        elements.append(Paragraph(period, styles["Normal"]))
        elements.append(Spacer(1, 12))

        summary = f"""
        <b>Total Delivered Orders:</b> {total_orders}<br/>
        <b>Total Product Sales:</b> BDT {total_product_sales}<br/>
        <b>Total Delivery Charges:</b> BDT {total_delivery_charge}<br/>
        <b>Grand Total Sales:</b> BDT {total_sales}
        """
        elements.append(Paragraph(summary, styles["Normal"]))
        elements.append(Spacer(1, 18))

        table_data = [
            [
                "Order ID",
                "Customer",
                "Email",
                "Phone",
                "City",
                "Payment",
                "Date",
                "Subtotal",
                "Delivery",
                "Grand Total",
            ]
        ]

        for order in orders:
            product_subtotal = Decimal(str(order.total_amount))
            delivery_charge = get_delivery_charge(product_subtotal)
            grand_total = product_subtotal + delivery_charge

            table_data.append(
                [
                    f"#{order.id}",
                    order.full_name,
                    order.email,
                    order.phone,
                    order.city,
                    order.payment_method.replace("_", " ").title(),
                    timezone.localtime(order.created_at).strftime("%Y-%m-%d"),
                    f"BDT {product_subtotal}",
                    "FREE"
                    if delivery_charge == Decimal("0.00")
                    else f"BDT {delivery_charge}",
                    f"BDT {grand_total}",
                ]
            )

        if total_orders == 0:
            table_data.append(
                [
                    "-",
                    "No delivered orders found",
                    "-",
                    "-",
                    "-",
                    "-",
                    "-",
                    "-",
                    "-",
                    "-",
                ]
            )

        table = Table(
            table_data,
            colWidths=[55, 100, 130, 80, 70, 100, 75, 80, 75, 85],
        )

        table.setStyle(
            TableStyle(
                [
                    ("BACKGROUND", (0, 0), (-1, 0), colors.lightgrey),
                    ("TEXTCOLOR", (0, 0), (-1, 0), colors.black),
                    ("ALIGN", (0, 0), (-1, -1), "CENTER"),
                    ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                    ("FONTSIZE", (0, 0), (-1, -1), 7),
                    ("BOTTOMPADDING", (0, 0), (-1, 0), 8),
                    ("GRID", (0, 0), (-1, -1), 0.5, colors.black),
                ]
            )
        )

        elements.append(table)
        doc.build(elements)

        buffer.seek(0)

        filename = f"sarn-date-wise-sales-report-{start_date}-to-{end_date}.pdf"

        response = HttpResponse(buffer, content_type="application/pdf")
        response["Content-Disposition"] = f'attachment; filename="{filename}"'

        return response