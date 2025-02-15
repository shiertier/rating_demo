"use client";

import React from "react";
import { Modal, ModalContent, ModalHeader, ModalBody } from "@heroui/react";
import { Icon } from "@iconify/react";

interface RatingHelpModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const ratingDescriptions = [
    {
        score: 0,
        description: "不进行评分，不好判断图片分数，直接按右键跳过这一张图"
    },
    {
        score: 1,
        description: "极低质量，无效图，低质量白膜图，杂乱的无价值图"
    },
    {
        score: 2,
        description: "质量较低或美学差的图"
    },
    {
        score: 3,
        description: "普通作品"
    },
    {
        score: 4,
        description: "质量或美学较高的图片"
    },
    {
        score: 5,
        description: "极高质量/美学，杰作！"
    }
];

export function RatingHelpModal({ isOpen, onClose }: RatingHelpModalProps) {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            classNames={{
                base: "max-w-md"  // 控制模态框宽度
            }}
        >
            <ModalContent>
                <ModalHeader className="flex flex-col gap-1 text-xl font-medium">
                    评分说明
                </ModalHeader>
                <ModalBody className="pb-6">
                    <div className="flex flex-col">
                        {ratingDescriptions.map(({ score, description }) => (
                            <div
                                key={score}
                                className="flex items-center py-2.5 border-b border-divider last:border-none"
                            >
                                <div className="flex items-center w-[120px] shrink-0">
                                    {score === 0 ? (
                                        <span className="text-default-500 text-sm">跳过</span>
                                    ) : (
                                        <div className="flex gap-0.5">
                                            {Array.from({ length: score }).map((_, i) => (
                                                <Icon
                                                    key={i}
                                                    icon="solar:star-bold"
                                                    className="text-yellow-400 text-lg"
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <p className="text-default-500 text-sm leading-5">
                                    {description}
                                </p>
                            </div>
                        ))}
                    </div>
                </ModalBody>
            </ModalContent>
        </Modal>
    );
}