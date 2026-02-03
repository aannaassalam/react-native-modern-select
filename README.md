# react-native-modern-select

A fully type-safe, headless-friendly Select and Multi-Select component for React Native, powered by
[@gorhom/bottom-sheet](https://github.com/gorhom/react-native-bottom-sheet).

`react-native-modern-select` is designed for real production apps and internal design systems where:

- the data shape is not fixed
- strong typing matters
- UI must be customizable
- and large option lists must remain usable

---

## ✨ Features

- ✅ Single select & multi select
- ✅ Fully type-safe generic API (`Select<T>`)
- ✅ Works with any data shape (no forced `{label, value}` model)
- ✅ Built-in search
- ✅ Bottom sheet powered by `@gorhom/bottom-sheet`
- ✅ Custom input renderer
- ✅ Custom option renderer
- ✅ Custom footer (for multi-select)
- ✅ Confirm / close footer for multi-select
- ✅ Styling hooks for default UI
- ✅ Suitable for design systems and component libraries

---

## 📦 Installation

```bash
npm install react-native-modern-select
```

or

```bash
yarn add react-native-modern-select
```

---

## ⚠️ Peer Dependencies (required)

This package depends on the following libraries which must already be installed in your app:

```bash
npm install @gorhom/bottom-sheet react-native-reanimated react-native-gesture-handler
```

---

## 🛠 Required setup

Because this component uses `@gorhom/bottom-sheet`, your application must already be configured correctly.

---

### 1. Gesture handler root

Wrap your application root:

```tsx
import { GestureHandlerRootView } from "react-native-gesture-handler";

<GestureHandlerRootView style={{ flex: 1 }}>
    <App />
</GestureHandlerRootView>;
```

---

### 2. Reanimated babel plugin

In `babel.config.js`:

```js
module.exports = {
    presets: ["module:metro-react-native-babel-preset"],
    plugins: ["react-native-reanimated/plugin"],
};
```

---

### 3. Bottom sheet provider (recommended)

```tsx
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";

<BottomSheetModalProvider>
    <App />
</BottomSheetModalProvider>;
```

---

## 🚀 Basic usage – single select

```tsx
import { Select } from "react-native-modern-select";

type User = {
    id: string;
    name: string;
};

const [user, setUser] = useState<User | null>(null);

<Select
    value={user}
    options={users}
    onChange={setUser}
    getKey={(u) => u.id}
    getLabel={(u) => u.name}
/>;
```

---

## 🚀 Multi select

```tsx
const [selectedUsers, setSelectedUsers] = useState<User[]>([]);

<Select
    multiple
    value={selectedUsers}
    options={users}
    onChange={setSelectedUsers}
    getKey={(u) => u.id}
    getLabel={(u) => u.name}
/>;
```

In multi-select mode:

- selections are toggled immediately
- the bottom sheet remains open
- a footer is displayed for confirmation / closing

---

## 🧠 Type safety

The component uses a discriminated union based on the `multiple` flag.

### Single select

```ts
multiple?: false
value: T | null
onChange: (value: T) => void
```

### Multi select

```ts
multiple: true
value: readonly T[]
onChange: (value: T[]) => void
```

TypeScript will enforce the correct contract automatically.

---

### ⚠️ Type inference when `value` is `null`

In most cases, you **do not need to explicitly pass the generic type** to `Select`.

TypeScript automatically infers the item type from the `options` (and/or `value`) prop:

```tsx
<Select
  options={users}
  value={selectedUser}
  ...
/>
```

However, if you use `null` as the value and your `options` are not strongly typed (for example, inline array literals or an empty array), TypeScript may not be able to correctly infer the generic type.

In that case, pass the type explicitly to the component:

```tsx
<Select
  options={users}
  value={null}
  ...
/>
```

This helps TypeScript resolve the correct type and prevents inference-related errors.

---

## 🔎 Search

Search is enabled by default.

```tsx
<Select isSearchable searchPlaceholder="Search users..." />
```

Disable search:

```tsx
<Select isSearchable={false} />
```

---

## 🎨 Custom input UI

```tsx
<Select
  ...
  renderInput={(label) => (
    <MyCustomInput value={label ?? "Select user"} />
  )}
/>
```

When `renderInput` is provided, the default input UI is not rendered.

---

## 🧩 Custom option row

```tsx
<Select
  ...
  renderOption={(item, selected) => (
    <View style={{ flexDirection: "row" }}>
      <Text>{item.name}</Text>
      {selected && <CheckIcon />}
    </View>
  )}
/>
```

---

## 🧾 Multi-select footer

A default footer button is shown for multi-select.

You can fully replace it:

```tsx
<Select
  multiple
  ...
  renderFooter={({ selected, confirm }) => (
    <MyButton
      title={`Apply (${selected.length})`}
      onPress={confirm}
    />
  )}
/>
```

Footer render context:

```ts
{
  selected: readonly T[]
  confirm: () => void
  close: () => void
}
```

---

## 🎨 Styling the default UI

```tsx
<Select
  ...
  containerStyle={{ marginTop: 12 }}
  inputStyle={{ borderColor: "#4f46e5" }}
  optionStyle={{ paddingHorizontal: 20 }}
  optionTextStyle={{ fontSize: 14 }}
/>
```

These style props affect only the default UI.
They are ignored when you use `renderInput` or `renderOption`.

---

## ⚙️ Bottom sheet height

```tsx
<Select snapPoints={["50%", "80%"]} />
```

Default:

```ts
["60%"];
```

---

# 📚 Props reference

`Select<T>` is fully generic and controlled.

---

## Common props (single & multi)

| Prop                | Type                                        | Description                             |
| ------------------- | ------------------------------------------- | --------------------------------------- |
| `options`           | `readonly T[]`                              | List of selectable items                |
| `getLabel`          | `(item: T) => string`                       | Returns the label shown for an item     |
| `getKey`            | `(item: T) => string`                       | Returns a unique stable key for an item |
| `placeholder`       | `string`                                    | Placeholder text for the default input  |
| `disabled`          | `boolean`                                   | Disables opening the select             |
| `isSearchable`      | `boolean`                                   | Enables or disables the search field    |
| `searchPlaceholder` | `string`                                    | Placeholder for the search input        |
| `renderInput`       | `(label: string \| null) => ReactNode`      | Replaces the default input UI           |
| `renderOption`      | `(item: T, selected: boolean) => ReactNode` | Replaces the default option row         |
| `snapPoints`        | `(string \| number)[]`                      | Bottom sheet snap points                |
| `containerStyle`    | `StyleProp<ViewStyle>`                      | Style for the pressable wrapper         |
| `inputStyle`        | `StyleProp<ViewStyle>`                      | Style for the default input container   |
| `optionStyle`       | `StyleProp<ViewStyle>`                      | Style for each option row               |
| `optionTextStyle`   | `StyleProp<TextStyle>`                      | Style for the default option text       |
| `confirmText`       | `string`                                    | Label for the default footer button     |
| `renderFooter`      | `(ctx) => ReactNode`                        | Custom footer renderer for multi-select |

---

## Single select only

| Prop       | Type                 | Description                     |
| ---------- | -------------------- | ------------------------------- |
| `multiple` | `false \| undefined` | Enables single-select mode      |
| `value`    | `T \| null`          | Selected value                  |
| `onChange` | `(value: T) => void` | Called when a value is selected |

---

## Multi select only

| Prop       | Type                   | Description                   |
| ---------- | ---------------------- | ----------------------------- |
| `multiple` | `true`                 | Enables multi-select mode     |
| `value`    | `readonly T[]`         | Selected values               |
| `onChange` | `(value: T[]) => void` | Called when selection changes |

---

## ⚠️ Important behavioral notes

- This component is fully controlled.
- It does not store selection state internally.
- In multi-select mode, selections are applied immediately.
- The footer is intended for UX confirmation and closing only.

---

## 🧱 Design philosophy

This component intentionally avoids enforcing a `{ label, value }` model.

Instead, you provide:

```ts
getLabel(item);
getKey(item);
```

This allows the component to work directly with domain models such as:

- users
- products
- roles
- tags
- countries
- CRM / ERP entities

without intermediate mapping layers.

---

## 🧑‍💻 Contributing

Contributions are welcome.

---

### Local development

```bash
npm install
npm run build
```

To test the package inside a React Native app:

```bash
npm install ../react-native-modern-select
```

(Using a local file install is recommended instead of `npm link` for React Native projects.)

---

### Contribution guidelines

- Keep the public API backward compatible
- Do not introduce hard dependencies on navigation, forms or state libraries
- Do not bundle native dependencies
- All new features must be fully typed
- Prefer extending the existing headless API:
    - `renderInput`
    - `renderOption`
    - `renderFooter`

- Keep default UI minimal and unopinionated

---

## 🐞 Bug reports & feature requests

Please include:

- React Native version
- iOS / Android
- minimal reproduction steps

---

## 📄 License

MIT

---

## 🙌 Credits

Built on top of:

- @gorhom/bottom-sheet
- react-native-reanimated
- react-native-gesture-handler
