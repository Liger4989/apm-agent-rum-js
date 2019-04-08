/**
 * MIT License
 *
 * Copyright (c) 2017-present, Elasticsearch BV
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 *
 */

const { transformSync } = require('@babel/core')
const APM_BASE_CODE = require('./src/apm-base')
const { version: agentVersion } = require('./package.json')

const pass = () => console.log('Agent version matches with build version')
const fail = version => {
  throw new Error(
    `Agent version ${agentVersion} does not match with build version - ${version}`
  )
}
const versionPlugin = ({ types: t }) => {
  return {
    name: 'babel-version-plugin',
    visitor: {
      MemberExpression(path) {
        const property = path.get('property')
        const name = property.node.name
        if (t.isIdentifier(property) && name === 'setVersion') {
          const args = path.parentPath.get('arguments')
          if (args.length > 0 && t.isStringLiteral(args[0])) {
            const version = args[0].node.value
            if (version !== agentVersion) {
              fail(version)
              process.exit(1)
            } else {
              pass()
            }
          }
        }
      }
    }
  }
}

transformSync(APM_BASE_CODE, {
  plugins: [versionPlugin]
})
