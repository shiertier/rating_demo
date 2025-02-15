// 服务条款和隐私政策弹窗组件
// 用于显示服务条款和隐私政策
// 服务条款和隐私政策包括服务条款和隐私政策

import React from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from "@heroui/react";

interface TermsModalProps {
    isOpen: boolean;
    onClose: () => void;
    type: 'terms' | 'privacy';
}

export default function TermsModal({ isOpen, onClose, type }: TermsModalProps) {
    const title = type === 'terms' ? '服务条款' : '隐私政策';

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            scrollBehavior="inside"
            size="2xl"
        >
            <ModalContent>
                <ModalHeader className="flex flex-col gap-1">{title}</ModalHeader>
                <ModalBody>
                    {type === 'terms' ? (
                        <>
                            <h3 className="text-lg font-semibold mb-2">项目说明</h3>
                            <p className="mb-4">
                                本项目用于获取互联网的图像进行大众评分，旨在建立开源的审美评分数据集，用于学术研究目的。
                            </p>

                            <h3 className="text-lg font-semibold mb-2">使用条款</h3>
                            <ul className="list-disc pl-5 space-y-2 mb-4">
                                <li>用户参与评分即表示同意将评分数据用于开源数据集。</li>
                                <li>评分数据将以匿名形式公开，用于学术研究。</li>
                                <li>本项目展示的所有图像均来源于网络，仅用于学习与研究目的。</li>
                                <li>用户不得下载、复制或传播这些图像，因为它们可能受版权保护。</li>
                            </ul>

                            <h3 className="text-lg font-semibold mb-2">免责声明</h3>
                            <p className="mb-4">
                                本项目不对图像的版权负责，如有侵权请联系我们删除。用户参与评分即表示理解并接受这些条款。
                            </p>
                        </>
                    ) : (
                        <>
                            <h3 className="text-lg font-semibold mb-2">信息收集</h3>
                            <p className="mb-4">
                                我们收集以下信息：
                            </p>
                            <ul className="list-disc pl-5 space-y-2 mb-4">
                                <li>基本账户信息（用户名、邮箱）</li>
                                <li>OAuth2登录信息（如使用第三方登录）</li>
                                <li>用户对图像的评分数据</li>
                            </ul>

                            <h3 className="text-lg font-semibold mb-2">信息使用</h3>
                            <ul className="list-disc pl-5 space-y-2 mb-4">
                                <li>用户的注册信息和OAuth2信息将被严格保密，不会泄露或用于其他目的。</li>
                                <li>评分数据将以匿名形式公开，作为开源数据集的一部分。</li>
                                <li>数据集将仅用于学术研究目的。</li>
                            </ul>

                            <h3 className="text-lg font-semibold mb-2">数据安全</h3>
                            <p className="mb-4">
                                我们采取适当的技术措施保护用户信息的安全。用户的密码经过加密存储，个人信息严格保密。
                            </p>
                        </>
                    )}
                </ModalBody>
                <ModalFooter>
                    <Button color="primary" onPress={onClose}>
                        我知道了
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}