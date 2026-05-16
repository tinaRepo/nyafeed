import { useState } from 'react';
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { API_BASE_URL } from '../lib/api';

const CONTACT_TYPES = [
    { value: 'bug', label: '不具合報告' },
    { value: 'delete_request', label: '削除依頼' },
    { value: 'report', label: '通報' },
    { value: 'request', label: '要望' },
    { value: 'other', label: 'その他' },
] as const

type ContactTypeValue = typeof CONTACT_TYPES[number]['value']

type Props = {
    onBack: () => void;
};

type FormState = {
    name: string
    email: string
    contactType: ContactTypeValue | ''
    detail: string
}

type FormErrors = {
    name?: string
    email?: string
    contactType?: string
    detail?: string
}

type SubmitState =
    | { status: 'idle' }
    | { status: 'loading' }
    | { status: 'success' }
    | { status: 'error'; message: string }

export default function ContactScreen({ onBack }: Props) {
    const [form, setForm] = useState<FormState>({
        name: '',
        email: '',
        contactType: '',
        detail: '',
    })
    const [errors, setErrors] = useState<FormErrors>({})
    const [submitState, setSubmitState] = useState<SubmitState>({ status: 'idle' })

    const validate = (): boolean => {
        const newErrors: FormErrors = {}
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

        if (!form.name.trim()) newErrors.name = 'お名前を入力してください'
        if (!form.email.trim()) newErrors.email = 'メールアドレスを入力してください'
        else if (!emailRegex.test(form.email))
            newErrors.email = 'メールアドレスの形式が正しくありません'
        if (!form.contactType) newErrors.contactType = '種別を選択してください'
        if (!form.detail.trim()) newErrors.detail = '詳細を入力してください'
        else if (form.detail.length > 1000)
            newErrors.detail = '1000文字以内で入力してください'

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async () => {
        if (!validate()) return

        setSubmitState({ status: 'loading' })
        try {
            const res = await fetch(`${API_BASE_URL}/contact`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: form.name.trim(),
                    email: form.email.trim(),
                    contactType: form.contactType,
                    detail: form.detail.trim(),
                }),
            })

            if (!res.ok) {
                const data = await res.json().catch(() => ({}))
                throw new Error(data.error ?? '送信に失敗しました')
            }

            setSubmitState({ status: 'success' })
        } catch (e) {
            const message = e instanceof Error ? e.message : '送信に失敗しました'
            setSubmitState({ status: 'error', message })
        }
    }

    const isLoading = submitState.status === 'loading'

    // 送信成功画面
    if (submitState.status === 'success') {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={onBack} style={styles.backBtn}>
                        <Text style={styles.backBtnText}>← 戻る</Text>
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>お問い合わせ</Text>
                    <View style={styles.headerRight} />
                </View>
                <View style={styles.successContainer}>
                    <Text style={styles.successIcon}>✅</Text>
                    <Text style={styles.successTitle}>送信が完了しました</Text>
                    <Text style={styles.successBody}>
                        お問い合わせありがとうございます。{'\n'}
                        内容を確認の上、順次ご対応いたします。
                    </Text>
                    <TouchableOpacity style={styles.backToFeedBtn} onPress={onBack}>
                        <Text style={styles.backToFeedBtnText}>フィードに戻る</Text>
                    </TouchableOpacity>
                </View>
            </View>
        )
    }

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            {/* ヘッダー */}
            <View style={styles.header}>
                <TouchableOpacity onPress={onBack} style={styles.backBtn}>
                    <Text style={styles.backBtnText}>← 戻る</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>お問い合わせ</Text>
                <View style={styles.headerRight} />
            </View>

            <ScrollView
                contentContainerStyle={styles.content}
                keyboardShouldPersistTaps="handled"
            >
                <Text style={styles.description}>
                    不具合報告・削除依頼・要望などをお気軽にどうぞ。{'\n'}
                    匿名での通報はフィードの🚩ボタンをご利用ください。
                </Text>

                {/* お名前 */}
                <View style={styles.field}>
                    <Text style={styles.label}>お名前 *</Text>
                    <TextInput
                        style={[styles.input, errors.name && styles.inputError]}
                        value={form.name}
                        onChangeText={(v) => {
                            setForm((p) => ({ ...p, name: v }))
                            if (errors.name) setErrors((p) => ({ ...p, name: undefined }))
                        }}
                        placeholder="例：田中 太郎"
                        placeholderTextColor="#bbb"
                        editable={!isLoading}
                    />
                    {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
                </View>

                {/* メールアドレス */}
                <View style={styles.field}>
                    <Text style={styles.label}>メールアドレス *</Text>
                    <TextInput
                        style={[styles.input, errors.email && styles.inputError]}
                        value={form.email}
                        onChangeText={(v) => {
                            setForm((p) => ({ ...p, email: v }))
                            if (errors.email) setErrors((p) => ({ ...p, email: undefined }))
                        }}
                        placeholder="例：example@gmail.com"
                        placeholderTextColor="#bbb"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        editable={!isLoading}
                    />
                    {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
                </View>

                {/* お問い合わせ種別 */}
                <View style={styles.field}>
                    <Text style={styles.label}>お問い合わせ種別 *</Text>
                    <View style={styles.typeList}>
                        {CONTACT_TYPES.map(({ value, label }) => (
                            <TouchableOpacity
                                key={value}
                                style={[
                                    styles.typeBtn,
                                    form.contactType === value && styles.typeBtnSelected,
                                ]}
                                onPress={() => {
                                    setForm((p) => ({ ...p, contactType: value }))
                                    if (errors.contactType) {
                                        setErrors((p) => ({ ...p, contactType: undefined }))
                                    }
                                }}
                                disabled={isLoading}
                            >
                                <Text style={[
                                    styles.typeBtnText,
                                    form.contactType === value && styles.typeBtnTextSelected,
                                ]}>
                                    {label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                    {errors.contactType && (
                        <Text style={styles.errorText}>{errors.contactType}</Text>
                    )}
                </View>

                {/* 詳細 */}
                <View style={styles.field}>
                    <Text style={styles.label}>詳細 *</Text>
                    <TextInput
                        style={[styles.textarea, errors.detail && styles.inputError]}
                        value={form.detail}
                        onChangeText={(v) => {
                            setForm((p) => ({ ...p, detail: v }))
                            if (errors.detail) setErrors((p) => ({ ...p, detail: undefined }))
                        }}
                        placeholder="詳細をご記入ください"
                        placeholderTextColor="#bbb"
                        multiline
                        numberOfLines={6}
                        maxLength={1000}
                        textAlignVertical="top"
                        editable={!isLoading}
                    />
                    <View style={styles.detailMeta}>
                        {errors.detail ? (
                            <Text style={styles.errorText}>{errors.detail}</Text>
                        ) : (
                            <Text style={styles.charCount}>{form.detail.length} / 1000</Text>
                        )}
                    </View>
                </View>

                {/* 送信エラー */}
                {submitState.status === 'error' && (
                    <View style={styles.submitErrorBox}>
                        <Text style={styles.submitErrorText}>
                            ⚠️ {submitState.message}
                        </Text>
                    </View>
                )}

                {/* 送信ボタン */}
                <TouchableOpacity
                    style={[styles.submitBtn, isLoading && styles.submitBtnDisabled]}
                    onPress={handleSubmit}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <View style={styles.loadingRow}>
                            <ActivityIndicator color="#fff" size="small" />
                            <Text style={styles.submitBtnText}>送信中…</Text>
                        </View>
                    ) : (
                        <Text style={styles.submitBtnText}>送信する</Text>
                    )}
                </TouchableOpacity>

                <View style={{ height: 40 }} />
            </ScrollView>
        </KeyboardAvoidingView>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    backBtn: { padding: 4 },
    backBtnText: { fontSize: 14, color: '#f97316' },
    headerTitle: { fontSize: 16, fontWeight: 'bold', color: '#333' },
    headerRight: { width: 50 },
    content: { padding: 20 },
    description: {
        fontSize: 13,
        color: '#888',
        lineHeight: 20,
        marginBottom: 24,
    },
    field: { marginBottom: 20 },
    label: {
        fontSize: 13,
        fontWeight: 'bold',
        color: '#555',
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 10,
        padding: 12,
        fontSize: 14,
        color: '#333',
        backgroundColor: '#fafafa',
    },
    textarea: {
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 10,
        padding: 12,
        fontSize: 14,
        color: '#333',
        backgroundColor: '#fafafa',
        minHeight: 120,
    },
    inputError: { borderColor: '#ef4444', backgroundColor: '#fff5f5' },
    errorText: { fontSize: 12, color: '#ef4444', marginTop: 4 },
    detailMeta: { alignItems: 'flex-end', marginTop: 4 },
    charCount: { fontSize: 11, color: '#bbb' },
    typeList: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    typeBtn: {
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        backgroundColor: '#fafafa',
    },
    typeBtnSelected: {
        borderColor: '#f97316',
        backgroundColor: '#fff7ed',
    },
    typeBtnText: {
        fontSize: 13,
        color: '#888',
    },
    typeBtnTextSelected: {
        color: '#f97316',
        fontWeight: 'bold',
    },
    submitErrorBox: {
        padding: 12,
        backgroundColor: '#fff5f5',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#fca5a5',
        marginBottom: 16,
    },
    submitErrorText: { fontSize: 13, color: '#ef4444' },
    submitBtn: {
        backgroundColor: '#f97316',
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: 'center',
    },
    submitBtnDisabled: { backgroundColor: '#fbd5b5' },
    submitBtnText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: 'bold',
    },
    loadingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    successContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 32,
    },
    successIcon: { fontSize: 64, marginBottom: 16 },
    successTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 12,
    },
    successBody: {
        fontSize: 14,
        color: '#888',
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 32,
    },
    backToFeedBtn: {
        backgroundColor: '#f97316',
        paddingVertical: 12,
        paddingHorizontal: 32,
        borderRadius: 24,
    },
    backToFeedBtnText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
    },
})