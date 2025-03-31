"use server"
import { Code } from 'bright';
import ReactMarkdown from 'react-markdown';

Code.theme = {
    light: "github-light",
    dark: "github-dark",
    lightSelector: "html.light",
}

interface PreviewProps {
    content: string;
}

const Preview = ({ content }: PreviewProps) => {
    if (!content) return null;

    // Basic content cleaning
    const cleanContent = content
        .replace(/\\/g, "")
        .replace(/&#x20;/g, "");

    return (
        <section className='markdown prose grid break-words'>
            <ReactMarkdown
                components={{
                    pre: (props) => (
                        <Code
                            lineNumbers
                            className='shadow-light-200 dark:shadow-dark-200'
                        >
                            {props.children}
                        </Code>
                    )
                }}
            >
                {cleanContent}
            </ReactMarkdown>
        </section>
    )
}

export default Preview
