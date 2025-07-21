import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface BubbleProps {
  content: {
    role: string;
    content: string;
  };
}

const Bubble = React.forwardRef<HTMLDivElement, BubbleProps>(({ content }, ref) => {
  const isUser = content.role === 'user';

  return (
    <div ref={ref} className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={`max-w-[80%] px-4 py-3 rounded-lg ${
          isUser
            ? 'bg-blue-600 text-white'
            : 'bg-gray-100 text-gray-800'
        }`}
      >
        {isUser ? (
          <p className="text-sm">{content.content}</p>
        ) : (
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            className="prose prose-sm max-w-none"
            components={{
              // Custom rendering for links to support underline
              a: ({ node, ...props }) => (
                <a
                  {...props}
                  className="text-blue-600 hover:text-blue-800 transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                />
              ),
              // Support for underline in links
              u: ({ node, ...props }) => (
                <span style={{ textDecoration: 'underline' }} {...props} />
              ),
              // Bold text
              strong: ({ node, ...props }) => (
                <strong className="font-bold text-gray-900" {...props} />
              ),
              // Code blocks
              code: ({ node, inline, ...props }) => (
                inline ? (
                  <code className="bg-gray-200 px-1 py-0.5 rounded text-sm" {...props} />
                ) : (
                  <code className="block bg-gray-200 p-2 rounded text-sm overflow-x-auto" {...props} />
                )
              ),
              // Headers
              h3: ({ node, ...props }) => (
                <h3 className="text-lg font-semibold mt-4 mb-2" {...props} />
              ),
              // Lists
              ul: ({ node, ...props }) => (
                <ul className="list-disc pl-5 space-y-1" {...props} />
              ),
              ol: ({ node, ...props }) => (
                <ol className="list-decimal pl-5 space-y-1" {...props} />
              ),
            }}
          >
            {content.content}
          </ReactMarkdown>
        )}
      </div>
    </div>
  );
});

Bubble.displayName = 'Bubble';

export default Bubble;