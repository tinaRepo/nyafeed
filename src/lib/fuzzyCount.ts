// リアクション数を曖昧ラベルに変換する

type FuzzyLabel = {
    label: string   // 表示テキスト
    level: number   // 強度（スタイル切り替え用）
}

const FUZZY_RULES: { min: number; max: number; label: string; level: number }[] = [
    { min: 0, max: 0, label: '', level: 0 },  // 0件は非表示
    { min: 1, max: 4, label: 'じわじわ人気', level: 1 },
    { min: 5, max: 19, label: 'かなり吸われている', level: 2 },
    { min: 20, max: 49, label: '猫好き達が集まっている', level: 3 },
    { min: 50, max: 99, label: '非常に危険な猫', level: 4 },
    { min: 100, max: Infinity, label: '猫神クラス', level: 5 },
]

export const toFuzzyLabel = (count: number): FuzzyLabel => {
    const rule = FUZZY_RULES.find(
        (r) => count >= r.min && count <= r.max
    )
    return {
        label: rule?.label ?? '',
        level: rule?.level ?? 0,
    }
}

// リアクション種類ごとの合計を計算
export const calcTotalReactions = (
    reactions: Record<string, number>
): number => {
    return Object.values(reactions).reduce((sum, v) => sum + v, 0)
}