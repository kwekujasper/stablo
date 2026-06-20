import React from "react";
import Navbar from "@/components/navbar";
import { cx } from "@/utils/all";
import Footer from "@/components/footer";

export default function Layout(props) {
  const { children } = props;
  return (
    <div className={cx(props?.fontStyle, "antialiased text-gray-800 dark:bg-black dark:text-gray-400")}>
      <Navbar {...props} />
      <div>{children}</div>
      <Footer {...props} />
    </div>
  );
}
