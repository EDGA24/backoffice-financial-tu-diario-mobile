import React from 'react';
import type { JSX } from 'react';
import { Avatar as MuiAvatar } from '@mui/material';
import type { SxProps, Theme } from '@mui/material';

export type AvatarSize = 'small' | 'medium' | 'large';

export interface AvatarProps {
  src?: string;
  alt?: string;
  children?: JSX.Element | any;
  size?: AvatarSize;
  sx?: SxProps<Theme>;
}

const sizeMap: Record<AvatarSize, { width: number; height: number }> = {
  small: { width: 32, height: 32 },
  medium: { width: 40, height: 40 },
  large: { width: 56, height: 56 },
};

const Avatar: React.FC<AvatarProps> = ({
  src,
  alt,
  children,
  size = 'medium',
  sx = {},
  ...props
}) => {
  return (
    <MuiAvatar
      src={src}
      alt={alt}
      sx={{
        ...sizeMap[size],
        backgroundColor: '#1e3c72',
        color: 'white',
        fontWeight: 600,
        ...sx,
      }}
      {...props}
    >
      {children}
    </MuiAvatar>
  );
};

export default Avatar;