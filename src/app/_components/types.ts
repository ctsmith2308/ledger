import { ReactNode } from 'react';

interface TypographyBase {
  children: ReactNode;
  className?: string;
}

interface HeaderProps extends TypographyBase {
  size: 1 | 2 | 3 | 4;
}

type ParagraphProps = TypographyBase;

type BlockquoteProps = TypographyBase;

type TypographyLargeProps = TypographyBase;

type TypographySmallProps = TypographyBase;

type TypographyMutedProps = TypographyBase;

export type {
  HeaderProps,
  ParagraphProps,
  BlockquoteProps,
  TypographyLargeProps,
  TypographySmallProps,
  TypographyMutedProps,
};
