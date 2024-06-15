import Navbar from "../component/Navbar";
import { Outlet } from "react-router-dom";
import Footer from "../component/footer/Footer";
import { Box, Center } from "@chakra-ui/react";

const Layout = () => {
  return (
    <Box>
      <Navbar />
      <Box maxW="1920px" mx="auto" px={4}>
        <Outlet />
      </Box>
      <Footer />
    </Box>
  );
};

export default Layout;
