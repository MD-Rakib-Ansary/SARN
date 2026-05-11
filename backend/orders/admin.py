from django.contrib import admin

from .models import Order, OrderItem


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = (
        "product_name",
        "price",
        "quantity",
        "subtotal",
    )


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "full_name",
        "email",
        "phone",
        "city",
        "payment_method",
        "total_amount",
        "status",
        "created_at",
    )

    list_filter = (
        "status",
        "payment_method",
        "city",
        "created_at",
    )

    search_fields = (
        "full_name",
        "email",
        "phone",
        "city",
    )

    readonly_fields = (
        "total_amount",
        "created_at",
        "updated_at",
    )

    inlines = [OrderItemInline]


@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "order",
        "product_name",
        "price",
        "quantity",
        "subtotal",
    )

    search_fields = (
        "product_name",
        "order__full_name",
        "order__email",
    )