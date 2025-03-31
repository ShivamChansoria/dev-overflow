import TagCard from '@/components/cards/TagCard';
import Preview from '@/components/Editor/Preview';
import Metric from '@/components/Metric';
import UserAvatar from '@/components/UserAvatar';
import ROUTES from '@/constants/routes';
import { getTimeStamp } from '@/lib/utils';
import Link from 'next/link';
import React from 'react'
import View from '../view';
import { incrementViews, getQuestion } from '@/lib/actions/question.action';
import { ITagDoc } from '@/database/tag.model';
import { IQuestionDoc } from '@/database/questions.model';
import { IUser } from '@/database/user.model';

const sampleQuestion = {
    id: "q123",
    title: "How to improve React app performance?",
    content: `### Question
  
  I'm looking for tips and best practices to enhance the performance of a React application. I have a moderately complex app with multiple components, and I've noticed some performance bottlenecks. What should I focus on?
  
  #### What I've Tried:
  - Lazy loading components
  - Using React.memo on some components
  - Managing state with React Context API
  
  #### Issues:
  - The app still lags when rendering large lists.
  - Switching between pages feels sluggish.
  - Sometimes, re-renders happen unexpectedly.
  
  #### Key Areas I Need Help With:
  1. Efficiently handling large datasets.
  2. Reducing unnecessary re-renders.
  3. Optimizing state management.
  
  Here is a snippet of my code that renders a large list. Maybe I'm doing something wrong here:
  
  \`\`\`js
  import React, { useState, useMemo } from "react";
  
  const LargeList = ({ items }) => {
    const [filter, setFilter] = useState("");
  
    // Filtering items dynamically
    const filteredItems = useMemo(() => {
      return items.filter((item) => item.includes(filter));
    }, [items, filter]);
  
    return (
      <div>
        <input
          type="text"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Filter items"
        />
        <ul>
          {filteredItems.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </div>
    );
  };
  
  export default LargeList;
  \`\`\`
  
  #### Questions:
  1. Is using \`useMemo\` the right approach here, or is there a better alternative?
  2. Should I implement virtualization for the list? If yes, which library would you recommend?
  3. Are there better ways to optimize state changes when dealing with user input and dynamic data?
  
  Looking forward to your suggestions and examples!
  
  **Tags:** React, Performance, State Management
    `,
    createdAt: "2025-01-15T12:34:56.789Z",
    upvotes: 42,
    downvotes: 3,
    views: 1234,
    answers: 5,
    tags: [
        { _id: "tag1", name: "React" },
        { _id: "tag2", name: "Node" },
        { _id: "tag3", name: "PostgreSQL" },
    ],
    author: {
        _id: "u456",
        name: "Jane Doe",
        image: "/avatars/jane-doe.png",
    },
};

interface PopulatedQuestion extends Omit<IQuestionDoc, 'author' | 'tags'> {
    author: IUser;
    tags: ITagDoc[];
}

const QuestionDetails = async ({ params }: RouteParams) => {
    const { id } = await params;
    const [_, { success, data: question }] = await Promise.all([
        await incrementViews({ questionId: id }),
        await getQuestion({ questionId: id })
    ]); /*-------------------> Parallel Data requests for  */

    if (!success || !question) {
        return <div>Question not found</div>;
    }

    const populatedQuestion = question as PopulatedQuestion;

    return (
        <>
            <View questionId={id} />
            <div className='flex-end w-full flex-col'>
                <div className='flex-end w-full flex-col gap-4'>
                    <div className='flex items-center gap-2'>
                        <UserAvatar id={sampleQuestion.author._id}
                            name={sampleQuestion.author.name}
                            className='size-22 '
                            fallbackClassName='text-[10px]'
                        />
                        <Link href={ROUTES.PROFILE(populatedQuestion.author._id)}>
                            <p className='paragraph-semibold text-dark-100_light700'>{populatedQuestion.author.name}</p>
                        </Link>
                    </div>
                    <div className='flex w-full justify-end'>
                        <p>Votes</p>
                    </div>
                </div>
                <h2 className='h2-semibold text-dark-200_light900'>{populatedQuestion.title}</h2>
            </div>
            <div className='mb-8 mt-5 flex flwx-wrap gap-4'>
                <Metric imgUrl='/icons/clock.svg'
                    alt='clock icon'
                    value={`asked ${getTimeStamp(new Date(populatedQuestion.createdAt))}`}
                    title=''
                    textStyles='small-regular text-dark-400_light700' />
                <Metric imgUrl='/icons/message.svg'
                    alt='message icon'
                    value={populatedQuestion.answers.length}
                    title='Answers'
                    textStyles='small-regular text-dark-400_light700' />
                <Metric imgUrl='/icons/eye.svg'
                    alt='eye icon'
                    value={populatedQuestion.views}
                    title='Views'
                    textStyles='small-regular text-dark-400_light700' />
            </div>
            <Preview content={populatedQuestion.content} />
            <div className='mt-8 flex flex-wrap gap-2'>
                {populatedQuestion.tags.map((tag: ITagDoc) => (
                    <TagCard key={tag._id}
                        _id={tag._id}
                        name={tag.name}
                        compact
                    />
                ))}
            </div>
        </>
    )
}

export default QuestionDetails
