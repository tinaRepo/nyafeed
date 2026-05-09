import { useRef, useState } from 'react';
import {
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export type PickedImage = {
    uri: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
};

type Props = {
    value: PickedImage | null;
    onChange: (image: PickedImage | null) => void;
};

const formatBytes = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const MAX_FILE_SIZE = 10 * 1024 * 1024;

export default function ImagePickerComponent({ value, onChange }: Props) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [validationError, setValidationError] = useState('');
    const [isHovered, setIsHovered] = useState(false); // ← ホバー状態を自前管理

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setValidationError('');
        const file = e.target.files?.[0];
        if (!file) return;

        if (!ACCEPTED_TYPES.includes(file.type)) {
            setValidationError('JPEG・PNG・GIF・WebP のみ選択できます');
            e.target.value = '';
            return;
        }

        if (file.size > MAX_FILE_SIZE) {
            setValidationError(
                `ファイルサイズは10MB以内にしてください（現在: ${formatBytes(file.size)}）`
            );
            e.target.value = '';
            return;
        }

        if (value?.uri) {
            URL.revokeObjectURL(value.uri);
        }

        const uri = URL.createObjectURL(file);
        onChange({
            uri,
            fileName: file.name,
            fileSize: file.size,
            mimeType: file.type,
        });

        e.target.value = '';
    };

    const handleRemove = () => {
        if (value?.uri) {
            URL.revokeObjectURL(value.uri);
        }
        onChange(null);
        setValidationError('');
    };

    const handleAreaClick = () => {
        inputRef.current?.click();
    };

    // 画像選択済み：プレビュー表示
    if (value) {
        return (
            <View style={styles.previewContainer}>
                <Image
                    source={{ uri: value.uri }}
                    style={styles.previewImage}
                    resizeMode="cover"
                />
                <View style={styles.fileInfoBar}>
                    <View style={styles.fileInfoLeft}>
                        <Text style={styles.fileName} numberOfLines={1}>
                            📎 {value.fileName}
                        </Text>
                        <Text style={styles.fileSize}>{formatBytes(value.fileSize)}</Text>
                    </View>
                    <View style={styles.fileInfoRight}>
                        <TouchableOpacity
                            style={styles.changeBtn}
                            onPress={handleAreaClick}
                        >
                            <Text style={styles.changeBtnText}>変更</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.removeBtn}
                            onPress={handleRemove}
                        >
                            <Text style={styles.removeBtnText}>✕</Text>
                        </TouchableOpacity>
                    </View>
                </View>
                <input
                    ref={inputRef}
                    type="file"
                    accept={ACCEPTED_TYPES.join(',')}
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                />
            </View>
        );
    }

    // 未選択：選択エリア表示
    return (
        <View>
            <TouchableOpacity
                style={[styles.dropArea, isHovered && styles.dropAreaHovered]}
                onPress={handleAreaClick}
                activeOpacity={0.8}
                // @ts-ignore: Web専用マウスイベント
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                <Text style={styles.dropIcon}>🐱</Text>
                <Text style={styles.dropTitle}>猫画像を選択</Text>
                <Text style={styles.dropSub}>タップしてギャラリーから選ぶ</Text>
                <Text style={styles.dropMeta}>JPEG / PNG / GIF / WebP・10MBまで</Text>
                <View style={styles.dropBadge}>
                    <Text style={styles.dropBadgeText}>ファイルを選択</Text>
                </View>
                <input
                    ref={inputRef}
                    type="file"
                    accept={ACCEPTED_TYPES.join(',')}
                    onChange={handleFileChange}
                    style={hiddenInputStyle}
                />
            </TouchableOpacity>

            {validationError ? (
                <View style={styles.errorBox}>
                    <Text style={styles.errorText}>⚠️ {validationError}</Text>
                </View>
            ) : null}

            <Text style={styles.skipNote}>
                ※ 省略すると投稿時にダミー画像が使われます
            </Text>
        </View>
    );
}

const hiddenInputStyle: React.CSSProperties = {
    position: 'absolute',
    inset: 0,
    opacity: 0,
    cursor: 'pointer',
    width: '100%',
    height: '100%',
};

const styles = StyleSheet.create({
    dropArea: {
        borderWidth: 2,
        borderColor: '#e0e0e0',
        borderRadius: 12,
        borderStyle: 'dashed',
        alignItems: 'center',
        paddingVertical: 28,
        paddingHorizontal: 16,
        backgroundColor: '#fafafa',
        position: 'relative',
        overflow: 'hidden',
    },
    dropAreaHovered: {
        borderColor: '#f97316',
        backgroundColor: '#fff7ed',
    },
    dropIcon: {
        fontSize: 40,
        marginBottom: 8,
    },
    dropTitle: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#444',
        marginBottom: 4,
    },
    dropSub: {
        fontSize: 13,
        color: '#888',
        marginBottom: 4,
    },
    dropMeta: {
        fontSize: 11,
        color: '#bbb',
        marginBottom: 12,
    },
    dropBadge: {
        backgroundColor: '#f97316',
        paddingVertical: 6,
        paddingHorizontal: 18,
        borderRadius: 20,
    },
    dropBadgeText: {
        color: '#fff',
        fontSize: 13,
        fontWeight: 'bold',
    },
    errorBox: {
        marginTop: 8,
        padding: 8,
        backgroundColor: '#fff5f5',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#fca5a5',
    },
    errorText: {
        fontSize: 12,
        color: '#ef4444',
    },
    skipNote: {
        marginTop: 6,
        fontSize: 11,
        color: '#bbb',
        textAlign: 'center',
    },
    previewContainer: {
        borderRadius: 12,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#e0e0e0',
        backgroundColor: '#f0f0f0',
    },
    previewImage: {
        width: '100%',
        height: 200,
    },
    fileInfoBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 12,
        paddingVertical: 8,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#eee',
    },
    fileInfoLeft: {
        flex: 1,
        marginRight: 8,
    },
    fileName: {
        fontSize: 12,
        color: '#555',
        fontWeight: 'bold',
    },
    fileSize: {
        fontSize: 11,
        color: '#aaa',
        marginTop: 1,
    },
    fileInfoRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    changeBtn: {
        paddingVertical: 4,
        paddingHorizontal: 10,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#f97316',
    },
    changeBtnText: {
        fontSize: 12,
        color: '#f97316',
        fontWeight: 'bold',
    },
    removeBtn: {
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    removeBtnText: {
        fontSize: 12,
        color: '#999',
    },
});