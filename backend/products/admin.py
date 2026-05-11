from django.contrib import admin
from .models import Product


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "name",
        "price",
        "old_price",
        "category",
        "stock",
        "is_featured",
        "created_at",
    )

    list_filter = (
        "category",
        "is_featured",
        "created_at",
    )

    search_fields = (
        "name",
        "category",
    )

    prepopulated_fields = {
        "slug": ("name",),
    }

    readonly_fields = (
        "created_at",
        "updated_at",
    )