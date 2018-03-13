'use strict' /* eslint-env jasmine */
/**
 * @license
 * Copyright 2018-present, Stephane M. Catala
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *  http: *www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * Limitations under the License.
 */
//
const getStateMachine = require('../').default

describe('getStateMachine:', function () {
  describe('when called with an `AutomataSpec` and an initial state:', function () {
    let state

    beforeEach(function () {
      state = getStateMachine({
        foo: {
          BAR: [ 'bar', 'foo-BAR' ]
        },
        bar: {
          FOO: [ 'foo', 'bar-FOO' ],
          BAZ: 'foo'
        }
      }, 'foo')
    })

    it('returns a function', function () {
      expect(state).toEqual(jasmine.any(Function))
    })

    describe('the returned function:', function () {
      let foo, bar

      beforeEach(function () {
        bar = state('BAR')[0]
        foo = state('FOO')[0]
      })

      it('is strictly equivalent to the state string it represents', function () {
        expect(foo).toBe(state)
        expect(bar('FOO')[0]).toBe(foo)
        expect(foo('BAR')[0]).toBe(bar)
      })

      describe('when called without argument', function () {
        let res

        beforeEach(function () {
          res = []
          res.push(foo())
          res.push(bar())
        })

        it('returns the current state', function () {
          expect(res).toEqual([ 'foo', 'bar' ])
        })
      })

      describe('when called with a command string', function () {
        let res

        beforeEach(function () {
          res = []
          res.push(foo('BAR'))
          res.push(bar('FOO'))
          res.push(bar('BAZ'))
          res.push(foo('FOO'))
          res.push(foo('BAZ'))
        })

        it('returns an array with the next state function and the command payload ' +
        'from the current state', function () {
          expect(res[0]).toEqual([ bar, 'foo-BAR' ])
          expect(res[1]).toEqual([ foo, 'bar-FOO' ])
          expect(res[2]).toEqual([ foo, void 0 ])
        })

        it('returns an array with the current state function ' +
        'and an `undefined` entry when the command is not recognized ' +
        'in the current state', function () {
          expect(res[3]).toEqual([ foo, void 0 ])
          expect(res[4]).toEqual([ foo, void 0 ])
        })
      })
    })
  })
})
