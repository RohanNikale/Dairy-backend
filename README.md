# Ambitious-backend


# API Documentation

Routes

- [/api/auth](#apiauth)
- [/api/user](#apiuser)
- [/api/product](#apiproduct)
- [/api/contact](#apicontact)
- [/api/order](#apiorder)
- [/api/cart](#apicart)
- [/api/rating](#apirating)
- [/api/coupon](#apicoupon)


# /api/auth
- [/send-otp](#send-otp)
- [/verify-otp](#verify-otp)
- [/login](#login)

    ## /send-otp
    POST:
    - required fields:
        ```
            body: {
                phoneno: String,
            }
        ```

    - success response json:
        ```
        {
            message: String,
            success: Boolean,
            userExists: Boolean,
        }
        ```

    ## /verify-otp
    POST:
    - required fields:
        ```
            body: {
                phoneno: String,
                otp: String,
            }
        ```

    - success response json:
        ```
            {
                message: String,
                success: Boolean,
                token: String,
            }
        ```

    ## /login
    POST:
    - required fields:
        ```
            body: {
                phoneno: String,
                password: String,
            }
        ```

    - success response json:
        ```
            {
                message: String,
                success: Boolean,
                token: String,
            }
        ```


# /api/user
- PUT:
    - required fields:
        ```
            header: {
                token: String,
            }
        ```

    - optional fields:
        ```
            body: {
                name: String,
                email: String,
                profilePic: String,
                gender: enum["male", "female", "other"],
                address: String,
                password: String,
            }
        ```

    - success response json:
        ```
            {
                success: Boolean,
                message: String,
                user: Object,
            }
        ```

- GET
    - required fields:
        ```
            header: {
                token: String,
            }
        ```
    
    - optional fields:
        ```
            body: {
                userId: String, //for admin
            }
        ```

    - success response json:
        ```
            {
                message: String,
                success: Boolean,
                user: Object,
            }
        ```

# /api/product
- POST
    - required fields:
        ```
            header: {
                token: String,
            }

            body: {
                name: String,
                price: Number,
            }
        ```

    - optional fields:
        ```
            body: {
                category: [String],
                keywords: [String],
                material: String,
                discount: Decimal,
                description: String,
                color: String,
                stock: Number,
                images: [String],
                weight: String,
                size: String,
            }
        ```

    - success response json:
        ```
            {
                success: Boolean,
                message: String,
                product: Object,
            }
        ```
    
- GET
    - optional fields:
        ```
            query: {
                s: Number,
                n: Number,
                id: String,
                category: [String],
                search: String,
                ratingSort: enum[1, -1], // 1 ascending, -1 descending
                priceSort: enum[1, -1], // 1 ascending, -1 descending
                variant: Boolean,
                gte: Number,
                lte: Number,
            }
        ```

    - success response json:
        ```
            {
                message: String,
                success: Boolean,
                productData: Object | [Object],
            }
        ```

- PUT
    - required fields:
        ```
            header: {
                token: String,
            }
            body: {
                id: String,
            }
        ```

    - optional fields:
        ```
            body: {
                name: String,
                category: [String],
                keywords: [String],
                material: String,
                discount: Decimal,
                description: String,
                color: String,
                price: Number,
                stock: Number,
                images: [String],
                weight: String,
                size: String,
            }
        ```

    - success response json:
        ```
            {
                message: String,
                success: Boolean,
                product: Object,
            }
        ```
    
- DELETE
    - required fields:
        ```
            header: {
                token: String,
            }
            
            body: {
                id: String,
            }
        ```
    
    - success response json:
        ```
            {
                message: String,
                success: Boolean,
                product: Object,
            }
        ```
    
# /api/contact
- /form
    ## /form
    - POST:
        - required fields:
            ```
                body: {
                    name: String,
                    email: String,
                    phone: Number,
                    reasonForContacting: String,
                    message: String,
                }
            ```

        - success response json:
            ```
                {
                    success: Boolean,
                    message: String,
                }
            ```


# /api/order
- POST:
    - required fields:
        ```
            header: {
                token: String
            }
        ```
        ```
            body: {
                orderData: {
                    items: [
                        {
                            id: String,
                            quantity: Number,
                        }
                    ],
                    shippingAddress : String,
                }
            }
        ```

    - optional fields:
        ```
            body:{
                couponId: String,
            }
        ```

    - success response json:
        ```
        {
            success: Boolean,
            message: String,
            order: Object,
        }
        ```

- GET:
    - required fields:
        ```
            header: {
                token: String
            }
        ```
    - optional fields:
        ```
        query: {
            orderId: String,
            userId: String,
            s: Number,
            n: Number,
        }
        ```

    - success response json:
        ```
        {
            success: Boolean,
            message: String,
            order: Object | [Object],
        }
        ```

- PUT:
    - required fields:
        ```
            header: {
                token: String
            }

            body: {
                orderId: String
            }
        ```
    - optional fields:
        ```
        body: {
            razorpayPaymentId: String, 
            razorpaySignature: String, 
            paymentStatus: "Failed",
        }
        ```

    - success response json:
        ```
        {
            success: Boolean,
            message: String,
            order: Object,
        }
        ```
- DELETE:
    - required fields:
        ```
            body: {
                orderId: 
            }
        ```

    - success response json:
        ```
        {
            success: Boolean,
            message: String,
            order: Object,
        }
        ```

# /api/cart
- [/addItem](#additem)
- [/getItems](#getitems)
- [/updateItem/:cartitemid](#updateitemcartitemid)
- [/deleteItem/:cartitemid](#deleteitemcartitemid)

    ## /addItem
    - POST:
        - required fields:
            ```
                header: {
                    token: String,
                }

                body: {
                    product: String,
                    quantity: Number,
                }
            ```

        - success response json:
            ```
            {
                success: Boolean,
                message: String,
                cartItem: Object,
            }
            ```

    ## /getItems
    - GET:
        - required fields:
            ```
                header: {
                    token: String,
                }
            ```

        - success response json:
            ```
            {
                success: Boolean,
                message: String,
                cartItems: Object | [Object],
            }
            ```

    ## /updateItem/:cartitemid
    - PUT:
        - required fields:
            ```
                header: {
                    token: String,
                }

                body: {
                    quantity: Number,
                }
            ```

        - success response json:
            ```
            {
                success: Boolean,
                message: String,
                cartItem: Object,
            }
            ```

    ## /deleteItem/:cartitemid
    - DELETE:
        - required fields:
            ```
                header: {
                    token: String,
                }
            ```

        - success response json:
            ```
            {
                success: Boolean,
                message: String,
                cartItem: Object,
            }
            ```

# /api/rating
- POST:
    - required fields:
        ```
            header: {
                token: String,
            }

            body: {
                userId: String,
                productId: String,
                rating: Decimal,
            }
        ```

    - success response json:
        ```
        {
            success: Boolean,
            message: String,
            ratingData: Object,
        }
        ```

- GET:
    - required fields:
        ```
            header: {
                token: String,
            }
        ```

    - optional fields:
        ```
            body: {
                //userId and productId both for rating of user for a product
                userId: String, //to get all ratings of a user
                productId: String, //to get all ratings of a product
            }
        ```

    - success response json:
        ```
        {
            success: Boolean,
            message: String,
            ratingData: Object | [Object],
        }
        ```

- DELETE:
    - required fields:
        ```
            header: {
                token: String,
            }

            body: {
                userId: String,
                productId: String,
            }
        ```

    - success response json:
        ```
        {
            success: Boolean,
            message: String,
        }
        ```

# /api/coupon
- POST:
    - required fields:
        ```
            header: {
                token: String,
            }

            body: {
                code: String,
                discount: Number,
                quantity: Number,
            }
        ```

    - optional fields:
        ```
            body: {
                name: String,
                category: [String],
            }
        ```

    - success response json:
        ```
        {
            success: Boolean,
            message: String,
            coupon: Object,
        }
        ```

- GET:
    - required fields:
        ```
            header: {
                token: String,
            }
        ```

    - optional fields:
        ```
            body: {
                id: String,
                category: [String],
            }
        ```

    - success response json:
        ```
        {
            success: Boolean,
            message: String,
            coupons: [Object];
        }
        ```

- PUT:
    - required fields:
        ```
            header: {
                token: String,
            }
            
            body: {
                id: String,
            }
        ```

    - optional fields:
        ```
            body: {
                name: String,
                code: String,
                discount: Number,
                quantity: Number,
                category: [String],
            }
        ```

    - success response json:
        ```
        {
            success: Boolean,
            message: String,
            coupons: Object;
        }
        ```

- DELETE:
    - required fields:
        ```
            header: {
                token: String,
            }

            body: {
                id: String,
            }
        ```

    - success response json:
        ```
        {
            success: Boolean,
            message: String,
            coupon: Object,
        }
        ```