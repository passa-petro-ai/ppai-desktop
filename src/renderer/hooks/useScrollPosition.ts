import { useState, useEffect, RefObject } from 'react';

export function useScrollPosition(scrollAreaRef: RefObject<HTMLDivElement>) {
	const [isAtTop, setIsAtTop] = useState(true);
	const [isAtBottom, setIsAtBottom] = useState(false);

	useEffect(() => {
		const handleScroll = () => {
			const scrollArea = scrollAreaRef.current;
			if (!scrollArea) return;

			const viewport = scrollArea.querySelector(
				'[data-radix-scroll-area-viewport]',
			);
			if (!viewport) return;

			const { scrollTop, scrollHeight, clientHeight } = viewport;
			const buffer = 1; // 1px buffer for better user experience

			setIsAtTop(scrollTop <= buffer);
			setIsAtBottom(scrollHeight - scrollTop - clientHeight <= buffer);
		};

		const scrollArea = scrollAreaRef.current;
		if (scrollArea) {
			scrollArea.addEventListener('scroll', handleScroll, true);
			// Call handleScroll initially to set the correct initial state
			handleScroll();
			return () => scrollArea.removeEventListener('scroll', handleScroll, true);
		}
	}, [scrollAreaRef]);

	console.log({ isAtTop, isAtBottom });

	return { isAtTop, isAtBottom };
}
