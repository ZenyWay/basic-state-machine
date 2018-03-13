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
import renderButton, { ButtonViewProps } from './view'
import behaviour, { CopyButtonProps } from './behaviour'
import createComponentFromStreamFactory, {
  ComponentFromStreamConstructor
} from 'component-from-stream'
import { Component } from 'inferno'
import { from } from 'rxjs/observable/from'

const componentFromStream = createComponentFromStreamFactory(Component, from)

export { ComponentFromStreamConstructor, CopyButtonProps, ButtonViewProps }

export default componentFromStream(renderButton, behaviour)
