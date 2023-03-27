import { UniversalAnimatedNumber } from '@tamagui/core'
import { useCallback } from 'react'
import {
  SharedValue,
  cancelAnimation,
  runOnJS,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated'

type ReanimatedAnimatedNumber = SharedValue<number>

export function useAnimatedNumber(
  initial: number
): UniversalAnimatedNumber<ReanimatedAnimatedNumber> {
  const val = useSharedValue(initial)
  return {
    getInstance() {
      'worklet'
      return val
    },
    getValue() {
      'worklet'
      return val.value
    },
    stop() {
      cancelAnimation(val)
    },
    setValue(next: number, config = { type: 'spring' }) {
      'worklet'
      if (config.type === 'direct') {
        val.value = next
      } else if (config.type === 'spring') {
        val.value = withSpring(next, config)
      } else {
        val.value = withTiming(next, config)
      }
    },
  }
}

export function useAnimatedNumberReaction(
  value: UniversalAnimatedNumber<ReanimatedAnimatedNumber>,
  cb: (current: number) => void
) {
  const callback = useCallback<typeof cb>((props) => cb(props), [cb])
  useAnimatedReaction(
    () => {
      return value.getValue()
    },
    (result, prev) => {
      'worklet'
      if (result !== prev) runOnJS(callback)(result)
    },
    [value, callback]
  )
}

export function useAnimatedNumberStyle<
  V extends UniversalAnimatedNumber<ReanimatedAnimatedNumber>
>(
  value: V,
  /**
   * `getStyle()` must be marked as a `worklet`
   */
  getStyle: (value: number) => any
) {
  return useAnimatedStyle(() => {
    'worklet'
    return getStyle(value.getValue())
  }, [value, getStyle])
}
