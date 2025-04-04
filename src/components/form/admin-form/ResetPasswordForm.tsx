"use client";
import React from "react";
import ComponentCard from "../../common/ComponentCard";
import Form from "../Form";
import Input from "../input/InputField";
import Button from "../../ui/button/Button";

export default function ResetPasswordForm() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:");
  };
  return (
    <ComponentCard title="Reset password">
      <Form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="col-span-full">
            <Input type="text" placeholder="Old Password" />
          </div>
          <div className="col-span-full">
            <Input type="text" placeholder="Password" />
          </div>
          <div className="col-span-full">
            <Input type="text" placeholder="Confirm Password" />
          </div>
          <div className="col-span-full">
            <Button className="w-full" size="sm">
              Submit
            </Button>
          </div>
        </div>
      </Form>
    </ComponentCard>
  );
}
