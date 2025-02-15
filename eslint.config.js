import js from '@eslint/js';

export default [
  js.configs.recommended,
  {
    ignores: ['src/app/**'], // 忽略 src/app 目录下的所有文件
  },
];
