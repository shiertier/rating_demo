"use client";

// 设置用户名弹窗组件
// 用于设置用户名
// 用户名包括用户名、错误信息

import React from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input } from "@heroui/react";

interface SetUsernameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (username: string) => void;
}

export function SetUsernameModal({ isOpen, onClose, onSubmit }: SetUsernameModalProps) {
  const [username, setUsername] = React.useState("");
  const [error, setError] = React.useState("");

  const validateUsername = (value: string) => {
    if (!value) {
      return "用户名不能为空";
    }
    if (value.length < 1 || value.length > 15) {
      return "用户名长度必须在1-15个字符之间";
    }
    if (!/^[a-zA-Z0-9-]+$/.test(value)) {
      return "用户名只能包含英文字母、数字和连字符(-)";
    }
    return "";
  };

  const handleSubmit = () => {
    const validationError = validateUsername(username);
    if (validationError) {
      setError(validationError);
      return;
    }
    onSubmit(username);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      isDismissable={false}
      hideCloseButton
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">设置用户名</ModalHeader>
        <ModalBody>
          <Input
            autoFocus
            label="用户名"
            placeholder="输入用户名"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              setError("");
            }}
            errorMessage={error}
            description="用户名将用于展示和个人主页，只能包含英文字母、数字和连字符(-)"
          />
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onPress={handleSubmit}>
            确认
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}