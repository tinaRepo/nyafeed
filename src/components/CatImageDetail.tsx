import {
    Dimensions,
    Image,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

// NOTE: EAS Build移行時にコメントを外してピンチズームを有効化
// import Animated, {
//   useAnimatedStyle,
//   useSharedValue,
//   withSpring,
//   runOnJS,
// } from 'react-native-reanimated';
// import {
//   Gesture,
//   GestureDetector,
//   GestureHandlerRootView,
// } from 'react-native-gesture-handler';

type Props = {
    uri: string;
    visible: boolean;
    onClose: () => void;
};

const SCREEN_WIDTH = Dimensions.get('window').width
const SCREEN_HEIGHT = Dimensions.get('window').height

// NOTE: EAS Build移行時の定数（ピンチズーム用）
// const MIN_SCALE = 1.0
// const MAX_SCALE = 4.0

export default function CatImageDetail({ uri, visible, onClose }: Props) {

    // NOTE: EAS Build移行時にコメントを外す（SharedValue）
    // const scale      = useSharedValue(1)
    // const translateX = useSharedValue(0)
    // const translateY = useSharedValue(0)
    // const savedScale = useSharedValue(1)
    // const savedX     = useSharedValue(0)
    // const savedY     = useSharedValue(0)

    // NOTE: EAS Build移行時にコメントを外す（リセット処理）
    // const resetTransform = () => {
    //   scale.value      = withSpring(1)
    //   translateX.value = withSpring(0)
    //   translateY.value = withSpring(0)
    //   savedScale.value = 1
    //   savedX.value     = 0
    //   savedY.value     = 0
    // }

    const handleClose = () => {
        // NOTE: EAS Build移行時は resetTransform() を呼ぶ
        // resetTransform()
        onClose()
    }

    // NOTE: EAS Build移行時にコメントを外す（ジェスチャー定義）
    // const pinchGesture = Gesture.Pinch()
    //   .onStart(() => { savedScale.value = scale.value })
    //   .onUpdate((e) => {
    //     const next = savedScale.value * e.scale
    //     scale.value = Math.min(MAX_SCALE, Math.max(MIN_SCALE, next))
    //   })
    //   .onEnd(() => {
    //     if (scale.value < MIN_SCALE) {
    //       scale.value      = withSpring(MIN_SCALE)
    //       translateX.value = withSpring(0)
    //       translateY.value = withSpring(0)
    //     }
    //     savedScale.value = scale.value
    //   })
    //
    // const panGesture = Gesture.Pan()
    //   .minDistance(4)
    //   .averageTouches(true)
    //   .onStart(() => {
    //     savedX.value = translateX.value
    //     savedY.value = translateY.value
    //   })
    //   .onUpdate((e) => {
    //     if (scale.value <= 1) return
    //     translateX.value = savedX.value + e.translationX * 0.6
    //     translateY.value = savedY.value + e.translationY * 0.6
    //   })
    //   .onEnd(() => {
    //     savedX.value = translateX.value
    //     savedY.value = translateY.value
    //   })
    //
    // const tapGesture = Gesture.Tap()
    //   .onEnd(() => { runOnJS(handleClose)() })
    //
    // const doubleTapGesture = Gesture.Tap()
    //   .numberOfTaps(2)
    //   .onEnd(() => {
    //     if (scale.value > 1) {
    //       scale.value      = withSpring(1)
    //       translateX.value = withSpring(0)
    //       translateY.value = withSpring(0)
    //       savedScale.value = 1
    //       savedX.value     = 0
    //       savedY.value     = 0
    //     } else {
    //       scale.value      = withSpring(2)
    //       savedScale.value = 2
    //     }
    //   })
    //
    // const imageGesture = Gesture.Race(
    //   doubleTapGesture,
    //   Gesture.Simultaneous(pinchGesture, panGesture),
    // )
    //
    // const animatedStyle = useAnimatedStyle(() => ({
    //   transform: [
    //     { scale: scale.value },
    //     { translateX: translateX.value },
    //     { translateY: translateY.value },
    //   ],
    // }))

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={handleClose}
        >
            {/* NOTE: EAS Build移行時は GestureHandlerRootView に差し替える */}
            {/* <GestureHandlerRootView style={styles.overlay}> */}
            <TouchableOpacity
                style={styles.overlay}
                onPress={handleClose}
                activeOpacity={1}
            >
                {/* NOTE: EAS Build移行時は以下に差し替える */}
                {/* 背景タップ */}
                {/* <GestureDetector gesture={tapGesture}> */}
                {/*   <View style={styles.background} /> */}
                {/* </GestureDetector> */}

                {/* NOTE: EAS Build移行時は GestureDetector + Animated.View に差し替える */}
                {/* <GestureDetector gesture={imageGesture}> */}
                {/*   <Animated.View style={[styles.imageWrapper, animatedStyle]}> */}
                <View style={styles.imageWrapper}>
                    <Image
                        source={{ uri }}
                        style={styles.image}
                        resizeMode="contain"
                    />
                </View>
                {/* NOTE: EAS Build移行時は閉じタグを戻す */}
                {/* </Animated.View> */}
                {/* </GestureDetector> */}

                {/* 閉じるボタン */}
                <TouchableOpacity
                    style={styles.closeBtn}
                    onPress={handleClose}
                >
                    <Text style={styles.closeBtnText}>✕</Text>
                </TouchableOpacity>

                {/* ヒント */}
                {/* NOTE: EAS Build移行時はヒントテキストを戻す */}
                {/* <View style={styles.hint} pointerEvents="none"> */}
                {/*   <Text style={styles.hintText}> */}
                {/*     ピンチで拡大・ダブルタップでリセット・背景タップで閉じる */}
                {/*   </Text> */}
                {/* </View> */}

            </TouchableOpacity>
            {/* NOTE: EAS Build移行時は </GestureHandlerRootView> に差し替える */}
        </Modal>
    )
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.92)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    // NOTE: EAS Build移行時に使用
    // background: {
    //   position: 'absolute',
    //   top: 0, left: 0, right: 0, bottom: 0,
    // },
    imageWrapper: {
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT * 0.8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    image: {
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT * 0.8,
    },
    closeBtn: {
        position: 'absolute',
        top: 48,
        right: 20,
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
    },
    closeBtnText: {
        fontSize: 16,
        color: '#fff',
        fontWeight: 'bold',
    },
    // NOTE: EAS Build移行時に使用
    // hint: {
    //   position: 'absolute',
    //   bottom: 48,
    //   alignSelf: 'center',
    //   backgroundColor: 'rgba(255,255,255,0.1)',
    //   paddingVertical: 6,
    //   paddingHorizontal: 14,
    //   borderRadius: 20,
    //   zIndex: 10,
    // },
    // hintText: {
    //   fontSize: 11,
    //   color: 'rgba(255,255,255,0.6)',
    //   textAlign: 'center',
    // },
})