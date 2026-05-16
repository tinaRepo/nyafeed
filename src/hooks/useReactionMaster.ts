import { useEffect, useState } from 'react'
import { getReactionMaster, ReactionMasterItem } from '../lib/api'

export const useReactionMaster = () => {
    const [reactionMaster, setReactionMaster] = useState<ReactionMasterItem[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        getReactionMaster()
            .then(setReactionMaster)
            .catch((e) => console.warn('reaction master fetch failed:', e))
            .finally(() => setIsLoading(false))
    }, [])

    return { reactionMaster, isLoading }
}