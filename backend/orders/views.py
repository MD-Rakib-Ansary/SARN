from calendar import month_name
from io import BytesIO

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

from rest_framework import generics, permissions
from rest_framework.views import APIView

from .models import Order
from .serializers import (
    AdminOrderStatusUpdateSerializer,
    OrderCreateSerializer,
    OrderListSerializer,
)


class OrderCreateView(generics.CreateAPIView):
    serializer_class = OrderCreateSerializer
    permission_classes = [permissions.IsAuthenticated]


class MyOrderListView(generics.ListAPIView):
    serializer_class = OrderListSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user)


class AdminOrderListView(generics.ListAPIView):
    queryset = Order.objects.all()
    serializer_class = OrderListSerializer
    permission_classes = [permissions.IsAdminUser]


class AdminOrderStatusUpdateView(generics.UpdateAPIView):
    queryset = Order.objects.all()
    serializer_class = AdminOrderStatusUpdateSerializer
    permission_classes = [permissions.IsAdminUser]


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

        total_sales = sum(order.total_amount for order in orders)
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
        <b>Total Sales:</b> BDT {total_sales}
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
                "Total",
            ]
        ]

        for order in orders:
            table_data.append(
                [
                    f"#{order.id}",
                    order.full_name,
                    order.email,
                    order.phone,
                    order.city,
                    order.payment_method.replace("_", " ").title(),
                    order.created_at.strftime("%Y-%m-%d"),
                    f"BDT {order.total_amount}",
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
                ]
            )

        table = Table(
            table_data,
            colWidths=[60, 130, 160, 90, 80, 110, 80, 90],
        )

        table.setStyle(
            TableStyle(
                [
                    ("BACKGROUND", (0, 0), (-1, 0), colors.lightgrey),
                    ("TEXTCOLOR", (0, 0), (-1, 0), colors.black),
                    ("ALIGN", (0, 0), (-1, -1), "CENTER"),
                    ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                    ("FONTSIZE", (0, 0), (-1, -1), 8),
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