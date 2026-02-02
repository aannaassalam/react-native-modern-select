import BottomSheet, {
    BottomSheetBackdrop,
    BottomSheetFlatList,
    BottomSheetFooter,
    BottomSheetFooterProps,
    BottomSheetTextInput,
    BottomSheetView,
} from "@gorhom/bottom-sheet";
import React, { useCallback, useMemo, useRef, useState } from "react";
import {
    Keyboard,
    Platform,
    Pressable,
    StyleProp,
    StyleSheet,
    Text,
    TextStyle,
    View,
    ViewStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type BaseSelectProps<T> = {
    options: readonly T[];

    getLabel: (item: T) => string;
    getKey: (item: T) => string;

    placeholder?: string;
    disabled?: boolean;

    isSearchable?: boolean;
    searchPlaceholder?: string;

    renderOption?: (item: T, selected: boolean) => React.ReactNode;
    renderInput?: (label: string | null) => React.ReactNode;

    snapPoints?: (string | number)[];
    containerStyle?: StyleProp<ViewStyle>;
    inputStyle?: StyleProp<ViewStyle>;
    optionStyle?: StyleProp<ViewStyle>;
    optionTextStyle?: StyleProp<TextStyle>;
    confirmText?: string;

    renderFooter?: (ctx: {
        selected: readonly T[];
        confirm: () => void;
        close: () => void;
    }) => React.ReactNode;
};

type SingleSelectProps<T> = {
    multiple?: false;
    value: T | null;
    onChange: (value: T) => void;
};

type MultiSelectProps<T> = {
    multiple: true;
    value: readonly T[];
    onChange: (value: T[]) => void;
};

export type SelectProps<T> = BaseSelectProps<T> &
    (SingleSelectProps<T> | MultiSelectProps<T>);

export function Select<T>(props: SelectProps<T>) {
    const {
        value,
        options,
        onChange,
        getLabel,
        getKey,
        placeholder = "Select...",
        disabled,
        isSearchable = true,
        searchPlaceholder = "Search...",
        renderOption,
        renderInput,
        snapPoints = ["60%"],
        multiple,
        containerStyle,
        inputStyle,
        optionStyle,
        optionTextStyle,
        confirmText,
    } = props;

    const bottomSheetRef = useRef<BottomSheet>(null);
    const insets = useSafeAreaInsets();

    const [search, setSearch] = useState("");

    const open = useCallback(() => {
        if (disabled) return;
        bottomSheetRef.current?.expand();
    }, [disabled]);

    const close = useCallback(() => {
        bottomSheetRef.current?.close();
        setSearch("");
    }, []);

    const confirm = useCallback(() => {
        close();
    }, [close]);

    const isSelected = useCallback(
        (item: T) => {
            if (props.multiple) {
                return props.value.some((v) => getKey(v) === getKey(item));
            }

            return props.value != null && getKey(props.value) === getKey(item);
        },
        [props, getKey],
    );

    const selectedLabel = useMemo(() => {
        if (props.multiple) {
            if (!props.value.length) return null;

            return props.value.map(getLabel).join(", ");
        }

        return props.value ? getLabel(props.value) : null;
    }, [props, getLabel]);

    const onItemPress = useCallback(
        (item: T) => {
            if (props.multiple) {
                const exists = props.value.some(
                    (v) => getKey(v) === getKey(item),
                );

                const next = exists
                    ? props.value.filter((v) => getKey(v) !== getKey(item))
                    : [...props.value, item];

                props.onChange(next);
                return;
            }

            props.onChange(item);
            close();
        },
        [props, getKey, close],
    );

    const filteredOptions = useMemo(() => {
        if (!isSearchable || !search.trim()) return options;

        const s = search.toLowerCase();

        return options.filter((o) => getLabel(o).toLowerCase().includes(s));
    }, [options, search, isSearchable, getLabel]);

    const renderItem = useCallback(
        ({ item }: { item: T }) => {
            const selected = isSelected(item);

            return (
                <Pressable
                    onPress={() => onItemPress(item)}
                    style={[styles.option, optionStyle]}
                >
                    {renderOption ? (
                        renderOption(item, selected)
                    ) : (
                        <Text
                            style={[
                                styles.optionText,
                                selected && styles.selected,
                                optionTextStyle,
                            ]}
                        >
                            {getLabel(item)}
                        </Text>
                    )}
                </Pressable>
            );
        },
        [value, getKey, getLabel, onChange, close, renderOption],
    );

    const renderFooter = useCallback(
        (footerProps: BottomSheetFooterProps) => {
            if (!props.multiple) return null;

            return (
                <BottomSheetFooter {...footerProps} bottomInset={0}>
                    <View
                        style={{
                            paddingTop: 12,
                            paddingBottom:
                                Platform.OS === "ios"
                                    ? insets.bottom
                                    : insets.bottom + 12,
                            backgroundColor: "#fff",
                        }}
                    >
                        {props.renderFooter ? (
                            props.renderFooter({
                                selected: props.value,
                                confirm,
                                close,
                            })
                        ) : (
                            <Pressable
                                onPress={confirm}
                                style={styles.confirmButton}
                            >
                                <Text style={styles.confirmText}>
                                    {props.confirmText ?? "Close"}
                                </Text>
                            </Pressable>
                        )}
                    </View>
                </BottomSheetFooter>
            );
        },
        [props, confirm, close],
    );

    return (
        <>
            <Pressable
                onPress={open}
                disabled={disabled}
                style={containerStyle}
            >
                {renderInput ? (
                    renderInput(selectedLabel)
                ) : (
                    <View style={[styles.input, inputStyle]}>
                        <Text
                            style={[
                                styles.inputText,
                                !selectedLabel && styles.placeholder,
                            ]}
                        >
                            {selectedLabel ?? placeholder}
                        </Text>
                    </View>
                )}
            </Pressable>

            <BottomSheet
                ref={bottomSheetRef}
                index={-1}
                snapPoints={snapPoints}
                enablePanDownToClose
                footerComponent={renderFooter}
                onClose={Keyboard.dismiss}
                topInset={insets.top}
                enableDynamicSizing={false}
                backdropComponent={(p) => (
                    <BottomSheetBackdrop
                        {...p}
                        appearsOnIndex={0}
                        disappearsOnIndex={-1}
                    />
                )}
                keyboardBehavior="extend"
                keyboardBlurBehavior="restore"
            >
                <BottomSheetFlatList
                    data={filteredOptions}
                    keyExtractor={(item) => getKey(item)}
                    renderItem={renderItem}
                    keyboardShouldPersistTaps="handled"
                    keyboardDismissMode="interactive"
                    enableFooterMarginAdjustment={multiple}
                    contentContainerStyle={[
                        styles.listContent,
                        !multiple && { paddingBottom: insets.bottom + 16 },
                    ]}
                    stickyHeaderIndices={[0]}
                    ListHeaderComponent={
                        isSearchable ? (
                            <View style={styles.stickyHeader}>
                                <BottomSheetTextInput
                                    value={search}
                                    onChangeText={setSearch}
                                    placeholder={searchPlaceholder}
                                    placeholderTextColor="#D9D9D9"
                                    style={styles.search}
                                    enterKeyHint="search"
                                />
                            </View>
                        ) : null
                    }
                />
            </BottomSheet>
        </>
    );
}

const styles = StyleSheet.create({
    input: {
        height: 48,
        borderColor: "#D9D9D9",
        backgroundColor: "#fff",
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 12,
        justifyContent: "center",
    },
    inputText: {
        fontSize: 16,
    },
    placeholder: {
        color: "#D9D9D9",
    },
    sheetContent: {
        flex: 1,
        paddingHorizontal: 16,
    },
    listContent: {
        paddingHorizontal: 16,
    },
    stickyHeader: {
        backgroundColor: "#fff",
        paddingBottom: 12,
    },
    search: {
        height: 40,
        borderWidth: 1,
        borderColor: "#D9D9D9",
        borderRadius: 8,
        paddingHorizontal: 12,
    },
    option: {
        paddingVertical: 12,
    },
    optionText: {
        fontSize: 16,
    },
    selected: {
        fontWeight: "600",
    },
    confirmButton: {
        height: 48,
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#111",
        marginHorizontal: 16,
    },

    confirmText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#fff",
        letterSpacing: 0.2,
    },
});
