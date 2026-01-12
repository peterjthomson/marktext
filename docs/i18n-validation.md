# i18n 资源文件校验

本项目使用 ESLint 搭配 `eslint-plugin-i18n-json` 和 `eslint-plugin-jsonc` 来校验 i18n 资源文件的格式和一致性。

## 配置说明

### 安装的插件

- `eslint-plugin-i18n-json`: 专门用于校验 i18n JSON 文件的插件
- `eslint-plugin-jsonc`: 用于正确解析和校验 JSON 文件格式

### 校验规则

在 `eslint.config.js` 中配置了以下规则：

1. **基础 JSON 格式校验**（通过 `eslint-plugin-jsonc`）
   - JSON 语法正确性
   - 文件末尾换行符
   - 缩进和格式规范

2. **i18n 特定校验**（通过 `eslint-plugin-i18n-json`）
   - `valid-json`: 确保 JSON 格式有效
   - `sorted-keys`: 建议按字母顺序排列键名
   - `identical-keys`: 确保所有语言文件具有相同的键结构（以 `en.json` 为基准）

## 使用方法

### 校验 i18n 文件

```bash
# 校验所有 i18n JSON 文件
npm run lint:i18n

# 或直接使用 ESLint
npx eslint src/shared/i18n/locales/*.json
```

### 自动修复格式问题

```bash
# 自动修复可修复的格式问题
npm run lint:i18n:fix

# 或直接使用 ESLint
npx eslint src/shared/i18n/locales/*.json --fix
```

## 校验的文件

校验范围包括 `src/shared/i18n/locales/` 目录下的所有 JSON 文件：

- `de.json` - 德语
- `en.json` - 英语（基准文件）
- `es.json` - 西班牙语
- `fr.json` - 法语
- `ja.json` - 日语
- `ko.json` - 韩语
- `pt.json` - 葡萄牙语
- `zh-CN.json` - 简体中文
- `zh-TW.json` - 繁体中文

## 常见问题

### 键结构不一致

如果某个语言文件缺少或多出了键，`identical-keys` 规则会报错。需要确保所有语言文件的键结构与 `en.json` 保持一致。

### JSON 格式错误

如果 JSON 文件存在语法错误（如缺少引号、逗号等），`valid-json` 规则会报错。可以使用 `--fix` 参数自动修复部分格式问题。

### 键排序建议

`sorted-keys` 规则建议按字母顺序排列键名，这有助于提高文件的可维护性和可读性。

## 集成到 CI/CD

建议在 CI/CD 流程中添加 i18n 文件校验：

```yaml
# 示例：GitHub Actions
- name: Lint i18n files
  run: npm run lint:i18n
```

这样可以确保所有提交的 i18n 文件都符合项目规范。