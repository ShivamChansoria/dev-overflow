import React from 'react'
import QuestionForm from '@/components/forms/QuestionForm'
import { auth } from '@/auth';
import { redirect } from 'next/navigation';

const AskAQuestion = async () => {
  const session = await auth();
  if (!session) redirect('/sign-in');
  return (
    <div>
      <h1 className="text-dark100_light900 h1-bold ">Ask a Question</h1>
      <div className='mt-9'>
        <QuestionForm />
      </div>
    </div>
  )
}

export default AskAQuestion 