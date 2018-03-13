/**
 * @license
 * Copyright 2018 Stephane M. Catala
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *  http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * Limitations under the License.
 */
//
import getStateMachine, { AutomataSpec } from '../'

export function keep (...keys: string[]) {
  return !keys.length
  ? function (previous: any) {
    return previous
  }
  : function (previous: object, current: object) {
    const okeys = Object.keys(current)
    return copy(keys, previous, copy(okeys, current, {}))
  }
}

export function forward (...keys: string[]) {
  return !keys.length
  ? function (_: any, current: any) {
    return current
  }
  : function (previous: object, current: object) {
    const okeys = Object.keys(previous)
    return copy(keys, current, copy(okeys, previous, {}))
  }
}

function copy (ks: string[], s: object, d: object) {
  let i = ks.length
  while (i--) {
    const k = ks[i]
    d[k] = s[k]
  }
  return d
}

export function withFsmReducer<P> (
  spec: AutomataSpec<Reducer<Action<any>,any>>,
  init: string
) {
  let state = getStateMachine(spec, init)

  return function (props: P, { type, payload }: Action<any>) {
    const [newState, reduce] = state(type)
    state = newState
    const update = reduce && reduce(props, payload)
    return update || props
  }
}

export { AutomataSpec }

export type Reducer<I,O> = (acc: O, input: I) => O

export interface Action<P> { type: string, payload?: P }

export function toggle (key: string) {
  return function (_, props: object) {
    return { ...props, [key]: !props[key] }
  }
}

export function withDefaults <P>(defaults: Partial<P>) {
  return function (_, props: P) {
    return Object.assign({}, defaults, props)
  }
}
