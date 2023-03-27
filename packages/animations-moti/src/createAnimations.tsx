// moti 🐼 animation driver by fernando rojo (https://moti.fyi)
import { usePresence } from '@tamagui/use-presence'
import { AnimationDriver } from '@tamagui/web'
import type { TransitionConfig } from 'moti'
import { useMotify } from 'moti/author'
import { useMemo } from 'react'
import Animated from 'react-native-reanimated'

import {
  useAnimatedNumber,
  useAnimatedNumberReaction,
  useAnimatedNumberStyle,
} from './useAnimatedNumber'

export const AnimatedView = Animated.View
export const AnimatedText = Animated.Text

export function createAnimations<Config extends Record<string, TransitionConfig>>(
  animations: Config
): AnimationDriver<Config> {
  AnimatedView['displayName'] = 'AnimatedView'
  AnimatedText['displayName'] = 'AnimatedText'

  return {
    isReactNative: true,
    animations,
    View: AnimatedView,
    Text: AnimatedText,
    useAnimatedNumber,
    useAnimatedNumberReaction,
    useAnimatedNumberStyle,
    usePresence,
    useAnimations: ({ props, presence, style, state }) => {
      /**
       * Example:
       *
       * ```jsx
       * <Stack
       *   animate={['quick', { type: 'timing', duration: 200 }]}
       * />
       * ```
       */
      const [animationKey, inlineTransition] = Array.isArray(props.animation)
        ? props.animation
        : [props.animation]
      const animateOnly = props.animateOnly ?? []
      let transition = animations[animationKey]
      if (!transition) {
        // @natew is this necessary? probably safer, but it will work with moti without setting this from the theme...
        return null
      }

      // if we specify any transition inline, override the one from our tamagui config
      Object.entries(inlineTransition ?? {}).forEach(([key, value]) => {
        transition[key] = value
      })

      if (process.env.NODE_ENV === 'development' && props['debug']) {
        const isEntering = !!state.unmounted
        const isExiting = presence?.[0] === false
        // eslint-disable-next-line no-console
        console.log('Moti animation', style, { isEntering, isExiting })
      }

      const { animate, nonAnimatedStyle } = useMemo(() => {
        // generate moti animate prop, and the plain style object
        let nonAnimatedStyle: Record<string, any> | undefined
        let animate = style
        if (animateOnly.length) {
          // immutable prop
          animate = { ...style }
          const animatedKeys = new Set(props.animateOnly)

          Object.entries(style).forEach(([styleKey, value]) => {
            if (isTransform(styleKey) && animatedKeys.has('transform')) {
              // example: this style is "scale" and animateOnly={['transform']}
              // we don't want to remove the transform array, since we're implying: animate all transforms
              return
            }
            if (!animatedKeys.has(styleKey)) {
              nonAnimatedStyle ??= {}
              nonAnimatedStyle[styleKey] = value

              delete animate[styleKey]
            }
          })
        }

        return {
          animate,
          nonAnimatedStyle,
        }
        // TODO
        // is style's reference ever stable? i hate to json-stringify...
      }, [JSON.stringify(style ?? {}), ...animateOnly])

      const motified = useMotify({
        transition,
        animate,
        // @nandorojo to @natew:
        // can you confirm that i don't need to pass these?
        // in the future, it would be useful if we did to avoid extra renders on mount

        // from: pseudos?.enterStyle as any,
        // exit: pseudos?.exitStyle as any,

        usePresenceValue: (presence as any) ?? undefined,
      })

      return useMemo(
        () => ({
          style: nonAnimatedStyle
            ? [motified.style, nonAnimatedStyle]
            : (motified.style as any),
        }),
        [motified.style, nonAnimatedStyle]
      )
    },
  }
}

const transforms = new Set([
  'perspective',
  'rotate',
  'rotateX',
  'rotateY',
  'rotateZ',
  'scale',
  'scaleX',
  'scaleY',
  'translateX',
  'translateY',
  'skewX',
  'skewY',
])

const isTransform = (key: string) => transforms.has(key)
