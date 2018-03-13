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
;
import { merge } from 'rxjs/observable/merge'
import { partition } from 'rxjs/operators'
import { Observable } from 'rxjs/Observable'

export type RxOperator<I,O> = ($: Observable<I>) => Observable<O>

export function shallowEqual(a: any, b: any) {
  if(a === b) { return true }
  const akeys = Object.keys(a)
  const bkeys = Object.keys(b)

  return akeys.length === bkeys.length && akeys.every(isEqualValues)

  function isEqualValues (key: string) {
    return a[key] === b[key]
  }
}

export function shallowMerge(...defs) {
  return function(...objs) {
    return Object.assign({}, ...defs, ...objs)
  }
}

export function pick <K extends string>(keys: ArrayLike<K>) {
  return isString(keys)
    ? pick(arguments)
    : function <T extends Partial<{ [P in K]: T[P] }>>(o: T): Pick<T,K> {
        const r = {} as Pick<T,K>
        let i = keys.length
        while (i--) {
          const k = keys[i]
          r[k] = o[k]
        }
        return r
      }
}

const indexOf = Array.prototype.indexOf
export function omit <K extends string>(...keys: K[]): <I extends O,O>(o: I) => O
export function omit <K extends string>(keys: ArrayLike<K>): <I extends O,O>(o: I) => O
export function omit <K extends string>(keys: ArrayLike<K>) {
  return isString(keys)
    ? omit(arguments)
    : function <I extends O,O>(o: I): O {
        const r = {} as O
        const okeys = Object.keys(o)
        let i = okeys.length
        while (i--) {
          const k = okeys[i]
          if (indexOf.call(keys, k) < 0) {
            r[k] = o[k]
          }
        }
        return r
      }
}

export function toProp (key: string) {
  return function <T>(val: T) {
    return { [key]: val }
  }
}

export function isString(v) {
  return typeof (v && v.valueOf()) === 'string'
}

export function identity <V>(v: V): V { return v }
