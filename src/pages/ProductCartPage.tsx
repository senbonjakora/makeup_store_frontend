import {
  Box,
  Button,
  Divider,
  Flex,
  Grid,
  GridItem,
  Heading,
  HStack,
  Input,
  Show,
  Spinner,
  Text,
  VStack,
} from "@chakra-ui/react";
import { Link } from "react-router-dom";
import { GoArrowLeft } from "react-icons/go";
import useCartSummary from "../hooks/useCartSummary";
import { useEffect, useState } from "react";
import { useUseCouponMutation } from "../redux/middleware/ProductApi";
import ProductCartLayout from "../component/ProductCartLayout";
import ProductCartHeader from "../component/ProductCartHeader";
import authService from "../services/authService";
import { useDispatch } from "react-redux";
import { syncCartList } from "../redux/slice/ProductCart";
import { AppDispatch } from "../redux/store";

const ProductCartPage = () => {
  const [useCoupon, { isLoading }] = useUseCouponMutation();
  const user = authService.getCurrentUser();
  const dispatch = useDispatch<AppDispatch>();
  const [productCoupon, setProductCoupon] = useState({
    coupon: "",
    discount: 0,
    errorMessage: "",
  });

  const {
    handleCheckBoxSelect,
    cartList,
    cartLength,
    totalPrice,
    discountedPrice,
    checkoutLoading,
    filteredCartLength,
    cartItemsDBLoading,
    goForPayment,
  } = useCartSummary({
    code: productCoupon.coupon,
    discount: productCoupon.discount,
  });

  useEffect(() => {
    if (user?.userId) {
      dispatch(syncCartList(user?.userId));
    }
  }, [user?.userId, dispatch]);

  return cartLength > 0 ? (
    <>
      {cartItemsDBLoading ? (
        <Flex justify={"center"} height={"100vh"} mt={20}>
          <Spinner display={"flex"} size={"xl"} />
        </Flex>
      ) : (
        <Grid
          templateColumns={{
            base: "repeat(1, 1fr)",
            sm: "repeat(1, 1fr)",
            md: "repeat(6, 1fr)",
          }}
          px={4}
          gap={3}
        >
          <GridItem colSpan={{ base: 6, sm: 6, md: 4 }} minH={"500px"}>
            <Flex width={"full"} flexDir={"column"}>
              <HStack
                justify={"space-between"}
                align={"center"}
                w={"full"}
                py={8}
              >
                <Heading fontSize={"x-large"}>Shopping Cart</Heading>
                <Heading fontSize={"x-large"}>{cartLength} Items</Heading>
              </HStack>

              <Divider />

              <Grid
                templateColumns={"repeat(1, 1fr)"}
                templateRows={"repeat(2, auto)"}
              >
                <Show above="md">
                  <ProductCartHeader />
                </Show>

                {cartList
                  .map((products, index) => (
                    <ProductCartLayout
                      handleCheckBox={handleCheckBoxSelect}
                      products={products}
                      key={index}
                    />
                  ))
                  .reverse()}
              </Grid>

              <Link to={"/"}>
                <HStack bgColor={"red.50"} align={"center"} py={5}>
                  <GoArrowLeft color="blue" />{" "}
                  <Text color="blue">Continue Shopping</Text>
                </HStack>
              </Link>
            </Flex>
          </GridItem>

          <GridItem colSpan={{ base: 6, sm: 6, md: 2 }} bgColor={"gray.50"}>
            <Box px={10} pb={10}>
              <Heading fontSize={"x-large"} py={8}>
                Order Summary
              </Heading>

              <Divider />

              <Flex justify={"space-between"} py={5}>
                <Text fontWeight={"bold"} fontSize={"medium"}>
                  ITEMS {filteredCartLength}
                </Text>
                <Text fontWeight={"bold"} fontSize={"medium"}>
                  {"$"}
                  {totalPrice}
                </Text>
              </Flex>

              <Flex flexDir={"column"} gap={6} pt={8}>
                <Text fontWeight={"bold"}>PROMO CODE</Text>

                {/* Coupon Input */}
                <Input
                  bgColor={"white"}
                  variant={"filled"}
                  boxShadow={"xs"}
                  value={productCoupon.coupon}
                  onChange={(event) => {
                    setProductCoupon({
                      ...productCoupon,
                      coupon: event.currentTarget.value,
                      errorMessage: "",
                    });
                  }}
                />
                {productCoupon.errorMessage && (
                  <Text fontSize={"small"} fontWeight={"500"} color={"red"}>
                    {productCoupon.errorMessage}
                  </Text>
                )}
                <Button
                  alignSelf={"start"}
                  colorScheme="orange"
                  borderRadius={1}
                  isLoading={isLoading}
                  onClick={async () => {
                    if (
                      !productCoupon.coupon ||
                      productCoupon.coupon.trim().length === 0
                    ) {
                      setProductCoupon({
                        ...productCoupon,
                        errorMessage: "Can not send empty coupon!",
                      });

                      return;
                    }

                    try {
                      const discountParcent = await useCoupon({
                        code: productCoupon.coupon,
                      }).unwrap();

                      setProductCoupon({
                        ...productCoupon,
                        discount: discountParcent,
                      });
                    } catch (error) {
                      if (
                        error &&
                        typeof error === "object" &&
                        "data" in error
                      ) {
                        setProductCoupon({
                          ...productCoupon,
                          errorMessage: error.data as string,
                        });
                      }
                    }
                  }}
                >
                  APPLY
                </Button>
              </Flex>

              <Box pt={"2rem"} pb={"0.7rem"}>
                <Divider />
              </Box>

              <Flex justify={"space-between"} py={3}>
                <Text fontWeight={"bold"} fontSize={"medium"}>
                  TOTAL
                </Text>
                <Text fontWeight={"bold"} fontSize={"medium"}>
                  ${totalPrice}
                </Text>
              </Flex>

              {productCoupon.discount !== 0 && (
                <Box py={2}>
                  <Flex
                    justify={"space-between"}
                    py={2}
                    fontSize={"xs"}
                    fontWeight={"400"}
                  >
                    <Text>DISCOUNT</Text>
                    <Text>{productCoupon.discount}%</Text>
                  </Flex>

                  <Flex justify={"space-between"} py={5}>
                    <Text fontWeight={"bold"} fontSize={"medium"}>
                      AFTER DISCOUNT
                    </Text>
                    <VStack>
                      <Text as="del" fontWeight={"bold"} fontSize={"medium"}>
                        ${totalPrice}
                      </Text>
                      <Text
                        fontWeight={"bold"}
                        fontSize={"medium"}
                        fontStyle={"italic"}
                      >
                        ${discountedPrice}
                      </Text>
                    </VStack>
                  </Flex>
                </Box>
              )}

              <Button
                w={"full"}
                colorScheme="orange"
                borderRadius={1}
                onClick={goForPayment}
                isLoading={checkoutLoading}
                isDisabled={filteredCartLength === 0}
              >
                CHECKOUT
              </Button>
            </Box>
          </GridItem>
        </Grid>
      )}
    </>
  ) : (
    <Flex justify={"center"} h={"100vh"}>
      <Heading>Empty cart</Heading>
    </Flex>
  );
};

export default ProductCartPage;
