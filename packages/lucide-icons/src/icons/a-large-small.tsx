import type { IconProps } from '@tamagui/helpers-icon'
import { themed } from '@tamagui/helpers-icon'
import PropTypes from 'prop-types'
import React, { memo } from 'react'
import {
  Defs,
  Ellipse,
  G,
  Line,
  LinearGradient,
  Path,
  Polygon,
  Polyline,
  RadialGradient,
  Rect,
  Stop,
  Svg,
  Symbol,
  Use,
  Circle as _Circle,
  Text as _Text,
} from 'react-native-svg'

const Icon = (props) => {
  const { color = 'black', size = 24, ...otherProps } = props
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...otherProps}
    >
      <Path d="M21 14h-5" stroke={color} />
      <Path d="M16 16v-3.5a2.5 2.5 0 0 1 5 0V16" stroke={color} />
      <Path d="M4.5 13h6" stroke={color} />
      <Path d="m3 16 4.5-9 4.5 9" stroke={color} />
    </Svg>
  )
}

Icon.displayName = 'ALargeSmall'

export const ALargeSmall = memo<IconProps>(themed(Icon))