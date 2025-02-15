"use client";

// 错误弹窗组件
// 用于显示错误信息
// 错误信息包括错误消息

import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from "@heroui/react";

interface ErrorModalProps {
    isOpen: boolean;
    onClose: () => void;
    message: string;
}

export default function ErrorModal({ isOpen, onClose, message }: ErrorModalProps) {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            size="sm"
        >
            <ModalContent>
                <ModalHeader className="flex flex-col gap-1">登录失败</ModalHeader>
                <ModalBody>
                    <p className="text-default-500">{message}</p>
                </ModalBody>
                <ModalFooter>
                    <Button color="primary" onPress={onClose}>
                        确定
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}