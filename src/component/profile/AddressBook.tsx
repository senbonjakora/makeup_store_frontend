import { AddIcon } from "@chakra-ui/icons";
import {
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  HStack,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Spacer,
  Spinner,
  useDisclosure,
} from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import {
  useGetAddressByIdQuery,
  useGetAllAddressesByUserIdQuery,
  useRemoveAddressByIdMutation,
  useSaveAddressMutation,
  useSetAddressTypeMutation,
  useUpdateAddressMutation,
} from "../../redux/middleware/ProductApi";
import useGetUser from "../../hooks/useGetUser"; 
import AddressList from "./AddressList";
import authService from "../../services/authService";

const addressSchema = z.object({
  address_line: z.string().min(5, { message: "Minimum 5 character required!" }),
  city: z.string().min(1, { message: "City name required!" }),
  state: z.string().min(1, { message: "State name required!" }),
  zip: z.string().min(2, { message: "Zip code required!" }),
  country: z.string().min(3, { message: "Minimum 3 character required!" }),
});

type AddressForm = z.infer<typeof addressSchema>;

const AddressBook = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [errorMessage, setErrorMessage] = useState("");
  const [saveAddress, { isLoading }] = useSaveAddressMutation();
  const [updateAddress] = useUpdateAddressMutation();
  const [setAddressType] = useSetAddressTypeMutation();
  const [removeAddressById] = useRemoveAddressByIdMutation();
  const user = authService.getCurrentUser();
  const [addressId, setAddressId] = useState<number | null>(null);

  const { data: addressById, refetch: refetchAddressById } =
    useGetAddressByIdQuery(
      {
        userId: user?.userId!,
        address_id: addressId ? addressId : -1,
      },
      {
        skip: !user?.userId,
      }
    );

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AddressForm>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      address_line: "",
      city: "",
      country: "",
      state: "",
      zip: "",
    },
  });

  const onAddressSubmit: SubmitHandler<AddressForm> = async (data) => {
    const d = { ...data, userId: user?.userId! };
    try {
      const response = await saveAddress(d).unwrap();

      if (response === "Address inserted") {
        refetch();
        onClose();
      }
    } catch (error: any) {
      setErrorMessage(error.data);
    }
  };

  const handAddressTypeSelect = async (address_id: number, type: string) => {
    const body = { userId: user?.userId!, address_id: address_id, type: type };
    const a = await setAddressType(body).unwrap();

    refetch();
  };

  const handleOnRemove = async (address_id: number) => {
    try {
      await removeAddressById({
        userId: user?.userId!,
        address_id: address_id,
      }).unwrap();

      refetch();
    } catch (error) {}
  };

  const handleOnEdit = (address_id: number) => {
    setAddressId(address_id);

    refetchAddressById();

    onOpen();
  };
  const onUpdateAddressSubmit: SubmitHandler<AddressForm> = async (data) => {
    const d = { ...data, userId: user?.userId!, address_id: addressId! };
    try {
      const res = await updateAddress(d).unwrap();
      const response = JSON.parse(res);
      if (response.affectedRows > 0) {
        refetch();
        onClose();
      }
    } catch (error: any) {
      setErrorMessage(error.data);
    }
  };
  const {
    data: addressess,
    isLoading: allAddressLoading,
    refetch,
  } = useGetAllAddressesByUserIdQuery(user?.userId!, {
    skip: !user?.userId,
  });

  useEffect(() => {
    if (addressById) {
      setValue("address_line", addressById?.[0]?.address_line || "");
      setValue("city", addressById?.[0]?.city || "");
      setValue("state", addressById?.[0]?.state || "");
      setValue("zip", addressById?.[0]?.zip || "");
      setValue("country", addressById?.[0]?.country || "");
    }
  }, [addressById, addressId, setValue]);

  if (allAddressLoading)
    return (
      <Flex justify={"center"} height={"100vh"} mt={20}>
        <Spinner display={"flex"} size={"xl"} />
      </Flex>
    );

  return (
    <Flex flexDir={"column"}>
      <HStack gap={3}>
        <Heading fontSize={"xl"}>Address Book</Heading>
        <Spacer />
        <Button
          leftIcon={<AddIcon />}
          onClick={() => {
            reset();
            onOpen();
            setAddressId(null);
          }}
        >
          New Address
        </Button>
      </HStack>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalCloseButton />
          <ModalHeader>Address</ModalHeader>
          <ModalBody>
            <form onSubmit={handleSubmit(onAddressSubmit)}>
              <FormControl isRequired isInvalid={!!errors.address_line}>
                <FormLabel htmlFor="address_line">Address Line</FormLabel>
                <Input {...register("address_line")} />
                <FormErrorMessage>
                  {errors.address_line && errors.address_line.message}
                </FormErrorMessage>
              </FormControl>

              <FormControl mt={4} isRequired isInvalid={!!errors.city}>
                <FormLabel htmlFor="city">City</FormLabel>
                <Input {...register("city")} />
                <FormErrorMessage>
                  {errors.city && errors.city.message}
                </FormErrorMessage>
              </FormControl>

              <FormControl mt={4} isRequired isInvalid={!!errors.state}>
                <FormLabel htmlFor="state">State/Province</FormLabel>
                <Input {...register("state")} />
                <FormErrorMessage>
                  {errors.state && errors.state.message}
                </FormErrorMessage>
              </FormControl>

              <FormControl mt={4} isRequired isInvalid={!!errors.zip}>
                <FormLabel htmlFor="zip">Zip/Postal Code</FormLabel>
                <Input {...register("zip")} />
                <FormErrorMessage>
                  {errors.zip && errors.zip.message}
                </FormErrorMessage>
              </FormControl>

              <FormControl mt={4} isRequired isInvalid={!!errors.country}>
                <FormLabel htmlFor="country">Country</FormLabel>
                <Input {...register("country")} />
                <FormErrorMessage>
                  {errors.country && errors.country.message}
                </FormErrorMessage>
              </FormControl>
            </form>
          </ModalBody>
          <ModalFooter>
            {addressId ? (
              <Button
                colorScheme="blue"
                mr={3}
                isLoading={isLoading || isSubmitting}
                type="submit"
                onClick={handleSubmit(onUpdateAddressSubmit)}
              >
                Update
              </Button>
            ) : (
              <Button
                colorScheme="blue"
                mr={3}
                isLoading={isLoading || isSubmitting}
                type="submit"
                onClick={handleSubmit(onAddressSubmit)}
              >
                Save
              </Button>
            )}
            <Button onClick={onClose}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Flex gap={15} flexDir={"column"} py={5}>
        {addressess?.map((address) => (
          <AddressList
            key={address.address_id}
            address={address}
            onChange={handAddressTypeSelect}
            onRemove={handleOnRemove}
            onEdit={handleOnEdit}
          />
        ))}
      </Flex>
    </Flex>
  );
};

export default AddressBook;