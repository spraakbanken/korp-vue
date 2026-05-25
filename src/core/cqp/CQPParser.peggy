{{
  import { mergeWith } from "lodash-es"

  function makeObj(type, op, val, flags) {
    return {type : type, op : op, val: val, flags: flags}
  }

  /** Join a list of elements, discarding the separator */
  const unpack = (head, tail) => [head, ...tail.map(([sep, item]) => item)]
}}


tokens
  = t1:token t2:(" " t2:token)*
  {
    return unpack(t1, t2).flat()
  }


token
  = "[" "]" repeat:repeat? {
    var result = {"and_block":[[{type:"word",op:"=",val:""}]]}
    if(repeat)
      result.repeat = repeat
    return [result]
  }
  / "[" left:and right:(" & " and)* "]" repeat:repeat? {
    var token = left
    right.forEach(function(item) {
      var val = item[1]
      token = mergeWith(token, val, function(a, b) {
        return Array.isArray(a) ? a.concat(b) : undefined;
      })
    })

    if(repeat)
      token.repeat = repeat

    const tokens = [token]

    // Translate lbound/rbound to a struct token before or after
    if (token.bound?.lbound) {
      tokens.unshift({struct: token.bound.lbound, start: true})
    }
    if (token.bound?.rbound) {
      tokens.push({struct: token.bound.rbound, start: false})
    }
    delete token.bound

    return tokens
  }
  / "<" end:"/"? tag:$[A-Za-z0-9_-]+ ">" {
    return [{ struct: tag, start: end ? false : true }]
  }

repeat
   = "{" from:$[0-9]+ "," to:$[0-9]+ "}"
    {
      return [Number(from), Number(to)]
    }


bound = val:("lbound" / "rbound") "(" tag:tag ")" {
  return [val, tag]
}


bound_block
  = first:bound rest:(" & " bound)*
  {
    return unpack(first, rest)
  }

and
  =  left:or right:(" | " or)* {
    return {and_block : [unpack(left, right)]}
  }
  / bound:bound_block {
    // Creates { lbound?: string, rbound?: string }
    bound = Object.fromEntries(bound)
    return {bound, and_block: []}
  }
  / "(" and:and ")" {return and}


or
  = lhs:$attribute " "? infix_op:infix_op " "? rhs:value_expr flags:(" %"[lcd]+)? {
    if(flags) {
      flags = Object.fromEntries(flags[1].map(flag => [flag, true]))
    }    
    return makeObj(lhs, infix_op, rhs, flags)
  }
  / date

attribute
  = "_."? $[A-Za-z0-9_-]+

tag
  = $[A-Za-z0-9_-]+

value_expr
    = ["] rhs:$('""' / [^"])* ["] {
        return rhs;
    }
    / ['] rhs:$("\\'" / [^'])* ['] {
        return rhs;
    }

// date_expr

date
  = "$" "date_interval" " "? op:("!=" / "=") " "? ["'] val:[0-9,]+ ['"]
{
  return makeObj("date_interval", op, val.join(""))
}

infix_op
  = "^="
  / "&="
  / "_="
  / "*="
  / "!="
  / "="
  / "!*="
  / "not contains"
  / "contains"
  / "highest_rank"
  / "not_highest_rank"
  / "rank_contains"
  / "not_rank_contains"
  / "regexp_contains"
  / "not_regexp_contains"
  / "starts_with_contains"
  / "ends_with_contains"
  / "incontains_contains"
  / "not_starts_with_contains"
  / "not_ends_with_contains"
  / "not_incontains_contains"

date_op
  = " <= "
  / " => "
  / " > "
  / " = "
  / " < "


bool
  = " & "
  / " | "
