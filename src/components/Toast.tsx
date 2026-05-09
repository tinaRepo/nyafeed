import { useEffect, useRef } from 'react';
import {
    Animated,
    PanResponder,
    StyleSheet,
    Text,
    View,
} from 'react-native';

type Props = {
    message: string;
    visible: boolean;
    onHide: () => void;
    duration?: number;  // 自動非表示までの時間（ms）デフォルト5000
};

export default function Toast({
    message,
    visible,
    onHide,
    duration = 5000,
}: Props) {
    const opacity = useRef(new Animated.Value(0)).current
    const translateY = useRef(new Animated.Value(-20)).current
    const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    // 自動非表示タイマーをセット
    const startHideTimer = () => {
        if (hideTimerRef.current) clearTimeout(hideTimerRef.current)
        hideTimerRef.current = setTimeout(() => {
            hideToast()
        }, duration)
    }

    const showToast = () => {
        Animated.parallel([
            Animated.timing(opacity, {
                toValue: 1,
                duration: 250,
                useNativeDriver: true,
            }),
            Animated.timing(translateY, {
                toValue: 0,
                duration: 250,
                useNativeDriver: true,
            }),
        ]).start(() => startHideTimer())
    }

    const hideToast = () => {
        if (hideTimerRef.current) clearTimeout(hideTimerRef.current)
        Animated.parallel([
            Animated.timing(opacity, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }),
            Animated.timing(translateY, {
                toValue: -20,
                duration: 200,
                useNativeDriver: true,
            }),
        ]).start(() => onHide())
    }

    useEffect(() => {
        if (visible) {
            opacity.setValue(0)
            translateY.setValue(-20)
            showToast()
        }
        return () => {
            if (hideTimerRef.current) clearTimeout(hideTimerRef.current)
        }
    }, [visible])

    // スワイプで閉じる（上方向）
    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: () => true,
            onPanResponderMove: (_, gestureState) => {
                // 上スワイプのみ反応
                if (gestureState.dy < 0) {
                    translateY.setValue(gestureState.dy)
                    opacity.setValue(1 + gestureState.dy / 80)
                }
            },
            onPanResponderRelease: (_, gestureState) => {
                if (gestureState.dy < -40) {
                    // 40px以上上スワイプ → 閉じる
                    hideToast()
                } else {
                    // 戻す
                    Animated.parallel([
                        Animated.spring(translateY, {
                            toValue: 0,
                            useNativeDriver: true,
                        }),
                        Animated.timing(opacity, {
                            toValue: 1,
                            duration: 100,
                            useNativeDriver: true,
                        }),
                    ]).start()
                }
            },
        })
    ).current

    if (!visible) return null

    return (
        <Animated.View
            style={[
                styles.container,
                { opacity, transform: [{ translateY }] },
            ]}
            {...panResponder.panHandlers}
        >
            <View style={styles.inner}>
                <Text style={styles.icon}>🐱</Text>
                <Text style={styles.message}>{message}</Text>
            </View>
            {/* 残り時間インジケーター */}
            <View style={styles.timerBar}>
                <TimerBar duration={duration} />
            </View>
        </Animated.View>
    )
}

// 残り時間を視覚化するバー
function TimerBar({ duration }: { duration: number }) {
    const width = useRef(new Animated.Value(100)).current

    useEffect(() => {
        Animated.timing(width, {
            toValue: 0,
            duration,
            useNativeDriver: false,
        }).start()
    }, [])

    return (
        <Animated.View
            style={[
                styles.timerBarFill,
                {
                    width: width.interpolate({
                        inputRange: [0, 100],
                        outputRange: ['0%', '100%'],
                    }),
                },
            ]}
        />
    )
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 12,
        left: 16,
        right: 16,
        backgroundColor: '#1a1a1a',
        borderRadius: 14,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
        elevation: 8,
        zIndex: 999,
    },
    inner: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingHorizontal: 16,
        paddingVertical: 14,
    },
    icon: {
        fontSize: 20,
    },
    message: {
        flex: 1,
        fontSize: 14,
        color: '#fff',
        fontWeight: 'bold',
    },
    timerBar: {
        height: 3,
        backgroundColor: 'rgba(255,255,255,0.15)',
    },
    timerBarFill: {
        height: 3,
        backgroundColor: '#f97316',
    },
})