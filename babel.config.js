module.exports = function (api) {
    api.cache(true);
    return {
        presets: ['babel-preset-expo'],
        // NOTE: react-native-reanimated/plugin
        // Expo Go では動作しないためコメントアウト
        // EAS Build（本番ビルド）移行時にコメントを外す
        // plugins: ['react-native-reanimated/plugin'],
    };
};