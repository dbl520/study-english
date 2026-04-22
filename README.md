# Study English Assistant

一个基于 Vue 3 + TypeScript 的英语学习助手 Demo。

## 当前能力

- 时态沙盒：通过时间 + 状态组合生成句子。
- 练习模式（P1）：
  - 选择题（时态识别）
  - 填空题（动词形式）
  - 纠错题（句子改错）
- 错题本：自动累计错误次数。
- 间隔复习（SRS）：按记忆间隔安排下次复习。
- 进度看板：掌握词汇数、整体进度、待复习数量。

## 快速开始

```bash
npm install
npm run dev
```

## 脚本

```bash
npm run dev
npm run build
npm run preview
npm run type-check
npm run lint
npm run format
npm run test
```

## 项目结构

- `src/App.vue`：主页面（沙盒 + 练习 + 错题本 + SRS 看板）。
- `src/composables/useStudyData.ts`：学习数据管理与 SRS 策略。
- `src/utils/srs.ts`：间隔复习算法。
- `src/utils/srs.test.ts`：SRS 单元测试。
