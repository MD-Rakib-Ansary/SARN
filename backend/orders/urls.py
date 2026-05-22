from django.urls import path

from .views import (
    AdminMonthlySalesReportView,
    AdminOrderListView,
    AdminOrderStatusUpdateView,
    MyOrderListView,
    OrderCreateView,
    OrderPayslipDownloadView,
)


urlpatterns = [
    path("create/", OrderCreateView.as_view(), name="order-create"),
    path("my-orders/", MyOrderListView.as_view(), name="my-orders"),
    path(
        "my-orders/<int:pk>/payslip/",
        OrderPayslipDownloadView.as_view(),
        name="order-payslip-download",
    ),
    path("admin/all/", AdminOrderListView.as_view(), name="admin-orders"),
    path(
        "admin/<int:pk>/status/",
        AdminOrderStatusUpdateView.as_view(),
        name="admin-order-status-update",
    ),
    path(
        "admin/monthly-report/",
        AdminMonthlySalesReportView.as_view(),
        name="admin-monthly-sales-report",
    ),
]