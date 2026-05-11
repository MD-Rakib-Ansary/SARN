from django.db import transaction
from rest_framework import serializers

from products.models import Product
from .models import Order, OrderItem


class OrderItemSerializer(serializers.ModelSerializer):
    product = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.all()
    )

    class Meta:
        model = OrderItem
        fields = [
            "id",
            "product",
            "product_name",
            "price",
            "quantity",
            "subtotal",
        ]
        read_only_fields = [
            "id",
            "product_name",
            "price",
            "subtotal",
        ]


class OrderCreateSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True)

    class Meta:
        model = Order
        fields = [
            "id",
            "full_name",
            "email",
            "phone",
            "address",
            "city",
            "payment_method",
            "total_amount",
            "status",
            "items",
            "created_at",
        ]
        read_only_fields = [
            "id",
            "total_amount",
            "status",
            "created_at",
        ]

    def validate_items(self, items):
        if not items:
            raise serializers.ValidationError("Order must contain at least one item.")

        for item in items:
            product = item["product"]
            quantity = item["quantity"]

            if quantity <= 0:
                raise serializers.ValidationError("Quantity must be greater than 0.")

            if product.stock < quantity:
                raise serializers.ValidationError(
                    f"Not enough stock for {product.name}."
                )

        return items

    @transaction.atomic
    def create(self, validated_data):
        items_data = validated_data.pop("items")

        request = self.context.get("request")
        user = None

        if request and request.user and request.user.is_authenticated:
            user = request.user

        order = Order.objects.create(
            user=user,
            **validated_data
        )

        for item_data in items_data:
            product = item_data["product"]
            quantity = item_data["quantity"]

            OrderItem.objects.create(
                order=order,
                product=product,
                quantity=quantity,
            )

            product.stock -= quantity
            product.save(update_fields=["stock"])

        order.update_total_amount()

        return order


class OrderListSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    username = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = [
            "id",
            "username",
            "full_name",
            "email",
            "phone",
            "address",
            "city",
            "payment_method",
            "total_amount",
            "status",
            "items",
            "created_at",
            "updated_at",
        ]

    def get_username(self, obj):
        if obj.user:
            return obj.user.username
        return "Guest"


class AdminOrderStatusUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = [
            "id",
            "status",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "updated_at",
        ]