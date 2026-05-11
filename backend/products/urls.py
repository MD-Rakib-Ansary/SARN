from django.urls import path

from .views import (
    AdminProductCreateView,
    AdminProductDeleteView,
    AdminProductUpdateView,
    ProductDetailView,
    ProductListView,
)


urlpatterns = [
    path("", ProductListView.as_view(), name="product-list"),
    path("<int:pk>/", ProductDetailView.as_view(), name="product-detail"),

    path("admin/create/", AdminProductCreateView.as_view(), name="admin-product-create"),
    path("admin/<int:pk>/update/", AdminProductUpdateView.as_view(), name="admin-product-update"),
    path("admin/<int:pk>/delete/", AdminProductDeleteView.as_view(), name="admin-product-delete"),
]