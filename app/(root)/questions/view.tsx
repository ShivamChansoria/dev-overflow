"use client"
import { incrementViews } from '@/lib/actions/question.action'
import React, { useEffect } from 'react'
import { toast } from 'sonner'

const View = ({ questionId }: { questionId: string }) => {
    const handlerIncrementViews = async () => {
        const result = await incrementViews({ questionId })
        if (result.success) {
            toast.success("View incremented!")
        }
        else {
            toast.error(result.error?.message || "Something went wrong")
        }
    }
    useEffect(() => {
        handlerIncrementViews()
    }, []);
    return null;
}

export default View;
