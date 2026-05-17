'use client';

import * as React from 'react';
import useEmblaCarousel, { type UseEmblaCarouselType } from 'embla-carousel-react';
import { ArrowLeft, ArrowRight } from 'lucide-react';

import { cn } from '../../lib/utils.js';
import { Button } from './button.js';

type CarouselApi = UseEmblaCarouselType[1];
type UseCarouselParameters = Parameters<typeof useEmblaCarousel>;
type CarouselOptions = UseCarouselParameters[0];
type CarouselPlugin = UseCarouselParameters[1];

type CarouselProps = {
  opts?: CarouselOptions;
  plugins?: CarouselPlugin;
  orientation?: 'horizontal' | 'vertical';
  setApi?: (api: CarouselApi) => void;
};
type CarouselRootProps = React.HTMLAttributes<HTMLDivElement> &
  CarouselProps & {
    ref?: React.Ref<HTMLDivElement>;
  };
type CarouselDivProps = React.HTMLAttributes<HTMLDivElement> & {
  ref?: React.Ref<HTMLDivElement>;
};
type CarouselButtonProps = React.ComponentProps<typeof Button> & {
  ref?: React.Ref<HTMLButtonElement>;
};

type CarouselContextProps = {
  carouselRef: ReturnType<typeof useEmblaCarousel>[0];
  api: ReturnType<typeof useEmblaCarousel>[1];
  scrollPrev: () => void;
  scrollNext: () => void;
  canScrollPrev: boolean;
  canScrollNext: boolean;
} & CarouselProps;
type CarouselSelectionListener = (api: NonNullable<CarouselApi>) => void;
type CarouselSelectionHandlerRef = React.RefObject<(api: CarouselApi) => void>;

const CarouselContext = React.createContext<CarouselContextProps | null>(null);

const createCarouselSelectionListener = (handlerRef: CarouselSelectionHandlerRef): CarouselSelectionListener => {
  return api => {
    handlerRef.current(api);
  };
};

function useCarousel() {
  const context = React.use(CarouselContext);

  if (!context) {
    throw new Error('useCarousel must be used within a <Carousel />');
  }

  return context;
}

const Carousel = React.memo(function Carousel({
  orientation = 'horizontal',
  opts,
  setApi,
  plugins,
  className,
  children,
  ref,
  ...props
}: CarouselRootProps) {
  const [carouselRef, api] = useEmblaCarousel(
    {
      ...opts,
      axis: orientation === 'horizontal' ? 'x' : 'y',
    },
    plugins,
  );
  const [canScrollPrev, setCanScrollPrev] = React.useState(false);
  const [canScrollNext, setCanScrollNext] = React.useState(false);

  const onSelect = React.useCallback((api: CarouselApi) => {
    if (!api) {
      return;
    }

    setCanScrollPrev(api.canScrollPrev());
    setCanScrollNext(api.canScrollNext());
  }, []);
  const onSelectRef = React.useRef(onSelect);
  const setApiRef = React.useRef(setApi);

  React.useEffect(() => {
    onSelectRef.current = onSelect;
  }, [onSelect]);
  const syncCarouselSelectionRef = React.useRef<CarouselSelectionListener | null>(null);

  if (!syncCarouselSelectionRef.current) {
    syncCarouselSelectionRef.current = createCarouselSelectionListener(onSelectRef);
  }

  React.useEffect(() => {
    setApiRef.current = setApi;
  }, [setApi]);

  const scrollPrev = React.useCallback(() => {
    api?.scrollPrev();
  }, [api]);

  const scrollNext = React.useCallback(() => {
    api?.scrollNext();
  }, [api]);

  const navigateCarouselWithKeyboard = React.useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        scrollPrev();
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        scrollNext();
      }
    },
    [scrollPrev, scrollNext],
  );
  const carouselContextValue = React.useMemo(
    () => ({
      carouselRef,
      api: api,
      opts,
      orientation: orientation || (opts?.axis === 'y' ? 'vertical' : 'horizontal'),
      scrollPrev,
      scrollNext,
      canScrollPrev,
      canScrollNext,
    }),
    [api, canScrollNext, canScrollPrev, carouselRef, opts, orientation, scrollNext, scrollPrev],
  );

  React.useEffect(() => {
    if (!api) {
      return;
    }

    setApiRef.current?.(api);
  }, [api]);

  React.useEffect(() => {
    if (!api) {
      return;
    }

    const syncCarouselSelection = syncCarouselSelectionRef.current;

    if (!syncCarouselSelection) {
      return;
    }

    syncCarouselSelection(api);
    api.on('reInit', syncCarouselSelection);
    api.on('select', syncCarouselSelection);

    return () => {
      api.off('reInit', syncCarouselSelection);
      api.off('select', syncCarouselSelection);
    };
  }, [api]);

  return (
    <CarouselContext.Provider value={carouselContextValue}>
      <div
        ref={ref}
        onKeyDownCapture={navigateCarouselWithKeyboard}
        className={cn('relative', className)}
        role="region"
        aria-roledescription="carousel"
        {...props}>
        {children}
      </div>
    </CarouselContext.Provider>
  );
});
Carousel.displayName = 'Carousel';

const CarouselContent = React.memo(function CarouselContent({ className, ref, ...props }: CarouselDivProps) {
  const { carouselRef, orientation } = useCarousel();

  return (
    <div ref={carouselRef} className="overflow-hidden">
      <div
        ref={ref}
        className={cn('flex', orientation === 'horizontal' ? '-ml-4' : '-mt-4 flex-col', className)}
        {...props}
      />
    </div>
  );
});
CarouselContent.displayName = 'CarouselContent';

const CarouselItem = React.memo(function CarouselItem({ className, ref, ...props }: CarouselDivProps) {
  const { orientation } = useCarousel();

  return (
    <div
      ref={ref}
      role="group"
      aria-roledescription="slide"
      className={cn('min-w-0 shrink-0 grow-0 basis-full', orientation === 'horizontal' ? 'pl-4' : 'pt-4', className)}
      {...props}
    />
  );
});
CarouselItem.displayName = 'CarouselItem';

const CarouselPrevious = React.memo(function CarouselPrevious({
  className,
  variant = 'outline',
  size = 'icon',
  onClick,
  ref,
  ...props
}: CarouselButtonProps) {
  const { orientation, scrollPrev, canScrollPrev } = useCarousel();
  const scrollToPreviousSlide = React.useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      onClick?.(event);

      if (!event.defaultPrevented) {
        scrollPrev();
      }
    },
    [onClick, scrollPrev],
  );

  return (
    <Button
      ref={ref}
      variant={variant}
      size={size}
      className={cn(
        'absolute  h-8 w-8 rounded-full',
        orientation === 'horizontal'
          ? '-left-12 top-1/2 -translate-y-1/2'
          : '-top-12 left-1/2 -translate-x-1/2 rotate-90',
        className,
      )}
      disabled={!canScrollPrev}
      onClick={scrollToPreviousSlide}
      {...props}>
      <ArrowLeft className="size-4" />
      <span className="sr-only">Previous slide</span>
    </Button>
  );
});
CarouselPrevious.displayName = 'CarouselPrevious';

const CarouselNext = React.memo(function CarouselNext({
  className,
  variant = 'outline',
  size = 'icon',
  onClick,
  ref,
  ...props
}: CarouselButtonProps) {
  const { orientation, scrollNext, canScrollNext } = useCarousel();
  const scrollToNextSlide = React.useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      onClick?.(event);

      if (!event.defaultPrevented) {
        scrollNext();
      }
    },
    [onClick, scrollNext],
  );

  return (
    <Button
      ref={ref}
      variant={variant}
      size={size}
      className={cn(
        'absolute h-8 w-8 rounded-full',
        orientation === 'horizontal'
          ? '-right-12 top-1/2 -translate-y-1/2'
          : '-bottom-12 left-1/2 -translate-x-1/2 rotate-90',
        className,
      )}
      disabled={!canScrollNext}
      onClick={scrollToNextSlide}
      {...props}>
      <ArrowRight className="size-4" />
      <span className="sr-only">Next slide</span>
    </Button>
  );
});
CarouselNext.displayName = 'CarouselNext';

export { type CarouselApi, Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext };
