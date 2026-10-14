---
type: Document
title: "Frontend Architectural Review Summary"
---

# Frontend Architectural Review Summary

## *Caboodle Web Application*

## **1\. Overview of Frontend Architecture**

### **Technology Stack**

\- Framework: Next.js 13.4.12 (App Router)

\- Language: TypeScript 5.1.6

\- React: 19.1.0

\- State Management: Zustand 4.4.1 (with persistence)

\- Data Fetching: TanStack React Query 4.33.0

\- Authentication: NextAuth 4.23.0

\- UI Libraries: Ant Design 5.23.2, PrimeReact 10.9.2

\- Styling: Tailwind CSS 3.3.3

\- HTTP Client: Axios 1.4.0

### 

### **Architecture Pattern**

Feature-based routing with Next.js App Router, using route groups for role-based layouts (\`(auth)\`, \`(brand)\`, \`(broker)\`).

## **2\. Strengths of Current Implementation**

### **2.1 Project Structure**

\- Clear separation: \`components/\`, \`hooks/\`, \`service/\`, \`store/\`, \`models/\`, \`helper/\`

\- Feature-based organization under \`app/\` with route groups

\- Centralized constants and enums

### **2.2 State Management**

\- Zustand with persistence for global state (brand, role)

\- React Query for server state with caching and invalidation

\- Separation of client and server state

### **2.3 Data Fetching**

\- Consistent React Query hooks pattern (\`useGet\*\`, \`useCreate\*\`, \`useUpdate\*\`)

\- Centralized query keys via \`QueryKeys\` enum

\- \`keepPreviousData\` for pagination

\- \`refetchOnWindowFocus: false\` to reduce unnecessary requests

### **2.4 Authentication**

\- NextAuth with JWT refresh

\- Token refresh before expiry (10 minutes)

\- Server-side session checks in layouts

\- Axios interceptors for token injection

### **2.5 Type Safety**

\- TypeScript across the codebase

\- Interface definitions in \`models/\`

\- Type-safe enums for constants

### **2.6 Code Organization**

\- Service layer abstraction (\`service/\`)

\- Reusable helper utilities

\- Shared components in \`shared-components/\`

## **3\. Weaknesses / Areas for Improvement**

### **3.1 TypeScript Configuration**

\- \`"strict": false\` in \`tsconfig.json\` reduces type safety

\- Missing strict null checks and implicit any checks

### **3.2 Component Architecture**

\- Mixed component sizes (e.g., \`FileExplorer.tsx\` \~870 lines, \`TradeSpendDetails.tsx\` \~1001 lines)

\- Limited use of \`React.memo\`, \`useMemo\`, \`useCallback\` (found in only 3 files)

\- Inconsistent component composition

### **3.3 Performance Optimizations**

\- Limited code splitting (only \`DashboardComponent\` uses \`dynamic\`)

\- No lazy loading for heavy components (e.g., AG Grid, CKEditor, ECharts)

\- Missing memoization for expensive computations

\- No virtual scrolling for large lists (except for Promo Events and Spins Void Report)

### **3.4 Error Handling**

\- Inconsistent error handling patterns

\- \`showErrorNotification\` relies on specific error shape

\- Generic fallback: "Something went wrong"

\- No global error boundary

\- Commented-out error handling in interceptors

### **3.5 API Integration**

\- Duplicate axios instances (\`httpClient\` and \`axiosInstanceFromClient\`)

\- Inconsistent header management (manual \`BrandID\` headers)

\- Mixed fetch and axios usage

\- No request/response transformation layer

### **3.6 State Management**

\- Limited Zustand usage (only global brand and role)

\- No clear pattern for feature-level state

\- Potential prop drilling in deep components

### **3.7 Code Quality**

\- Commented-out code (e.g., \`axiosInterceptor.ts\`, \`globalStore.ts\`)

\- Console logs in production code

\- Inconsistent naming (e.g., \`DitributorId\` vs \`DistributorId\` in tsconfig)

### **3.8 Testing**

\- Minimal test coverage (only \`WorkspaceContainer.test.tsx\`)

\- No integration tests

\- No E2E tests

### **3.9 Styling Architecture**

\- Mixed UI libraries (Ant Design \+ PrimeReact) can cause conflicts

\- Tailwind with custom CSS files

\- No design system or token system

\- Inconsistent spacing/sizing

### **3.10 Security Considerations**

\- Image domains set to \`"\*"\` in \`next.config.js\` (security risk)

\- No Content Security Policy

\- Token storage in localStorage via Zustand persist (XSS risk)

\- No rate limiting on client

## **4\. Technical Debt Findings**

### **4.1 High Priority**

1\. TypeScript strict mode disabled

2\. Image domain wildcard (\`domains: \["\*"\]\`)

3\. Commented-out code in production

4\. Duplicate axios instances

5\. Large monolithic components

### **4.2 Medium Priority**

1\. Missing error boundaries

2\. Limited performance optimizations

3\. Inconsistent error handling

4\. Mixed UI libraries

5\. No component library documentation

### **4.3 Low Priority**

1\. Missing JSDoc comments

2\. Console logs in production

3\. Inconsistent naming conventions

4\. No Storybook or component documentation

## **5\. Performance Review**

### **5.1 Current Performance Practices**

\- React Query caching

\- \`keepPreviousData\` for pagination

\- Dynamic import for \`DashboardComponent\`

\- Font optimization with \`next/font/google\`

### **5.2 Performance Gaps**

\- No lazy loading for heavy libraries (AG Grid, CKEditor, ECharts, Mapbox)

\- Limited memoization

\- No virtual scrolling for large tables

\- Missing image optimization (Next.js Image not consistently used)

\- No bundle analysis or code splitting strategy

\- Large initial bundle from multiple UI libraries

### **5.3 Recommendations**

1\. Implement route-based code splitting

2\. Lazy load heavy components (AG Grid, editors, charts)

3\. Use \`useMemo\`/\`useCallback\` for expensive computations

4\. Implement virtual scrolling for large lists

5\. Optimize images with Next.js Image

6\. Consider removing one UI library (Ant Design or PrimeReact)

## **6\. Security Considerations**

### **6.1 Current Security Measures**

\- JWT-based authentication with refresh tokens

\- Server-side session validation

\- Axios interceptors for token injection

\- 401 handling with automatic sign-out

### **6.2 Security Concerns**

1\. Image domain wildcard allows any external image

2\. Token storage in localStorage (XSS risk)

3\. No Content Security Policy headers

4\. No input sanitization visible

5\. No rate limiting on client

6\. Console logs may expose sensitive data

### **6.3 Recommendations**

1\. Restrict image domains to known sources

2\. Consider httpOnly cookies for tokens

3\. Implement CSP headers

4\. Add input validation/sanitization

5\. Remove console logs in production

6\. Add rate limiting for API calls

## **7\. UX/UI Structure Review**

### **7.1 Current Structure**

\- Role-based layouts (\`(brand)\`, \`(broker)\`, \`(auth)\`)

\- Consistent navigation via \`AppContainer\` and \`AppSidebar\`

\- Shared components for common UI patterns

### **7.2 UX/UI Concerns**

1\. Dual UI libraries can cause inconsistency

2\. No design system or component library

3\. Inconsistent loading states

4\. No skeleton loaders

5\. Limited accessibility considerations

6\. No responsive design patterns visible

### **7.3 Recommendations**

1\. Standardize on one UI library

2\. Create a design system

3\. Implement consistent loading states

4\. Add skeleton loaders

5\. Improve accessibility (ARIA, keyboard navigation)

6\. Ensure responsive design across breakpoints

## **8\. Code Quality & Maintainability Assessment**

### **8.1 Strengths**

\- Clear folder structure

\- TypeScript usage

\- Consistent hook patterns

\- Centralized constants and enums

### **8.2 Weaknesses**

1\. Large components (1000+ lines)

2\. Commented-out code

3\. Inconsistent error handling

4\. Limited documentation

5\. No code style guide enforcement

6\. Mixed patterns (functional vs class-like services)

### **8.3 Maintainability Score: 6.5/10**

\- Structure: 8/10

\- Type Safety: 5/10 (strict mode off)

\- Documentation: 4/10

\- Consistency: 6/10

\- Test Coverage: 2/10

## **9\. Architecture Diagrams**

### **9.2 State Management Flow**

[State Management Flow Mind map.png](https://drive.google.com/file/d/13SC2RrjqfHsQFr5if_XDz-F6fXkux3N0/view?usp=drive_link)

![][image1]

### **9.1 Application Flow**  **[Application Flow Diagram.png](https://drive.google.com/file/d/1-TYzwo0f5kWf-7V0o6QiJVd0Px_aZcTS/view?usp=drive_link)**

![][image2]

### **9.3 Component Hierarchy**

RootLayout → Providers → AppContainer → Sidebar/Header → Page Content

## **10\. Recommended Improvements & Action Items**

### **10.1 Immediate Actions (2 Sprint work)**

1\. Update Nextjs Version 

2\. Enable TypeScript strict mode

2\. Fix image domain security

3\. Remove commented code

4\. Consolidate axios instances

5\. Add error boundaries

### **10.2 Short-term (4 Sprint work)**

1\. Performance optimization

2\. Component refactoring

3\. Error handling standardization

4\. Testing infrastructure

### **10.3 Medium-term (6 Sprint work)**

1\. UI library consolidation

2\. Security enhancements

3\. Documentation

4\. Code quality

### **10.4 Long-term (Continuous)**

1\. Advanced performance

2\. Monitoring and analytics

3\. Accessibility

4\. Scalability

## **11\. Conclusion**

The application has a solid foundation with modern tooling and clear structure. Key priorities include type safety, security, performance, code quality, and component architecture.

Review Date: 13th November, 2025  

Reviewer: Md Mashiul Azam Chowdhury

Next Review: After recommended Improvements & Action

[image1]: <data:image/png;base64,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6Kafex1MzDX/st6mTZvMNn0HKfx1e7T/o6pSpUoqJyd2x0s3/3MSDkDvf/C+6W0AKigoCKxJAHJCFABnCECIqszqsRAUrqN00cFD9/6wARwiUQCcIQAhynQAOrVheVFH6aF/KXn0W/t/oRo4DKIAOEMAQpR1Prs8d4GA5CUKgDMEIESdDkCEICApiQLgDAEIpUHujLomBL35SHWxDUDCEgXAGQIQSosalfffDdIuOqOC2AdAQhEFwBkCEEqbMr/Y+G6dQBgCSrPw9zg8ogA4QwBCaXdaw/Kqa7vyqueFFYFSKfw9DY8oAM4QgAAAESUKgDMEIABARIkC4AwBCAAQUaIAOEMAAgBElCgAzhCAAAARJQqAMwQgAEBEiQLgDAEIABBRogA4QwACAESUKADOEIAAABElCoAzBCAAQESJAuAMAQgAEFGiADhDAAIARJQoAM4QgAAAESUKgDMEIABARIkC4AwBCAAQUaIAOEMAAgBElCgAzhCAAAARJQqAMwQgAEBEiQLgDAEIABBRogA4QwACAESUKADOEIAAABElCoAzBCAgmurVq6dmzpzpzfft2yf2ORbGjB0jageqH61hw4aZfuXKlapMmTKqZYuWYh+rbNmyona4Ro0aJWrFadO2jahFSa8be4laAhAFwBkCEBBNOgDpZueqwDf+pa1etdqM83LzVEFBgZo/f76ZT5kyJXDc7uzdatPGTSo3J9fM+/fvH1z3l7Z86fLAufML8tXOHTu97focdjxhwgRv/PXXX5vxps2b1J49ewJrLF++3DvP3j171e6ff7mOTZsC533wkQfNeOLEid6+g58cHDhvi2YtzFyHHd1uufWW/deZl+9d28oVK701/HR7fODjgZp+fPp69HjIn4eYXq9TVFSk3n33XTOfM3eOeV7t+jYAFRYWqmVLlgXW27hxY+Dc5trzYscNHz5cLV2y1Bx31x13eft9/PHHak3WGpWTkxM4btHiRd71aKtXx77O5553buAcb49928wbN2ps9vNvSyCiADhDAAKiSQcg3aemp6q2Z7T16qmpqabvc1Mf09s3vm3bt5m+fPnyXv30Vqd7x9n9rrryKm/+wZQPzLhcuXKBc/vZ49JS00y/cMHCQN322sWdLvbGE8bHglLFihVVfn6+Gds7NvaYiZMnmr5x48Ze/emnng7sc2qzUwPzSRMneedISUkxffPmzb2a/3rsNftrflWqVFHPPvNsYB/bd7igQ2CuA5AOSOE1fnPOb7zxnM/nBM6l9x85aqQ313e0dP/R1I/UZ59/5tXbtWsXOO7E+id68xWrVph+7Jixprf17OzswPzZ52OPI8GIAuAMAQiIJhuAbLP1rKws09/c+2Zvu+63bYkFoNVrYncMdLvz9ju94+x+ZcvIj43s3Qq/NT+sCRxn+wULFhRbL06v3r3Urbff6gUgrWbNmgc8pqQApO/GhPe1Aah3n95ezb/2ga5x1apVauOmjSUGoHBY0wGouHXuvfvewNy/j27+AGR9OvvTQADq27dv4LjLLr3Mm69YEgtA3bt3D6yxYHHw60AAAg4TAQiIJhuA+vTtoxo1auTVn/nLM2rGjBlqx44dZm7fAG0A0k1vs3Xd9uzeE5j/7YW/qS+/+lKdfdbZatpH07xtlv5IJ2df7KOZn7b9pKb+e6raunWrmvL+FO93kXQbPmy46tajmxnPnTtXVapcyVtDt/fee0+1at3KBKBZH8/yzjPoT4PUO+Pe8ea66XmrNq1KDED/nvpv9er/viruwiz6OvaRkW6Lv1msypXdfzcrNy/XXLNdy/rpp5/Uvj371Kuvv1piANJt5vSZ3lwHoPSMdLV23VpxDbplrc0y444XdlSTJ09W69evN2HzQAFI72PX13fu5n45N3B+3dsApD/u09e6Lzf2/IcDkO0TjCgAzhCAgMSnP3r5Nd8g/XeASouGDRuaPl7Pm/8OEEokCoAzBCAAKF56Wrqo4ZgSBcAZAhAAIKJEAXCGAAQAiChRAJwhAAEAIkoUAGcIQACAiBIFwBkCEBBftZ9qYX7OgKgIf49GmCgAzpSyHwagVPG/6TT5rKPKOKuq2AdAiUQBcIYABLjXaPYF5mfr5KzOYhuAQyYKgDMEIMCtpks78XMFuCEKgDO8UAPupDWtyM8U4I4oAM7wYg24o3+eKnWsLeoAjogoAM4QgAA30tvV5OcJcEsUAGd4wQbc0D9LJ/xvG1EHcMREAXCGAAS4wc8S4JwoAM7wog24wc8S4JwoAM7wog24wc8S4JwoAM7wog0cvbIVU/hZAtwTBcAZXrSBo5dSvTw/S4B7ogA4w4s2cPQIQEBciALgDC/awNEjAAFxIQqAM7xoA0ePAATEhSgAzvCiDRw9AhAQF6IAOMOLNnD0CEBAXIgC4Awv2sDRIwABcSEKgDO8aANHjwAExIUoAM7wog0cPQIQEBeiADjDizZw9AhAQFyIAuBMaXzRHjRwkLItvC1qvFYU/WvFkSMAAXEhCoAzpfFF2x98/ONmLZuJfcuVK2f6Jg2biG1hx51wnKiVKVNG1PxOaXaKN/Zfi5aTk+ONa9WqpbKyssx4wcIF++t1annjHTt2BI4/teWpgXmiueyyy0TtUPmf64oVK3rjD97/wPSPD3xc7N+wQUPvuPDXqrh1D0c8AlC9evVE7VDZx1Hv+ENbIy09TdSOtddff90bl/R1qlK1ijguvM/hsse//8H7YptrjU5qJGolXf+rr70qaklIFABn9It25Q7734SjbvCTg9XNvW8W9fALpm6VKldSW7ZsKXabv9+7d69q3759sdsKCwtV2bJl1aKFi9TgPw1WN/S8QX2z4Bs16+NZat++fcUeE76uSpUqBWo2AIWP8weg8LZEFA5AX3z2hSoqKlLLliwzcz3WrV27dmZumx3b4w4lAM2cNdMbr1q9yhzfuEljtXnzZnOeTz79RG3YuMHU9Zvsvyb+y9Sff/75wDolOVYBqG5mXe950XPbcvNyA3PdzBr/F4D8tR7dewTWCG8vbuxv4fqhruEfb/9pu5m3bdXWO/5QAtBZ7c5SK79d6a1T0vp6vHH9RjPWf4jxP945n88x80XfLDLfO7q9+9673nbd9PZeN/Yy81eGvmJqDRs3FOfwX6+tLV261JtXr1k9sN0fgPQfkGzzn7dBgwairlvNmjUD50wSogA4o1+0G3/ZUdSjatCTg1Tv3r0DtW7XdFPdu3c3Y/tRk33x0CZPmRyo2f6UU05RY98ZG9g3vM/bY95WKeVSzNzfdAAq6Ziwxx5/zGxrdkrsDpUNQJ07d/bW0/NwAPJvS0ThALRy2UrTv/6P2Bth5YzKsT491tepU0e1bNnSjP3Py6EEIC17T7YJOeHjmzVr5s1tr9+cMjMzD/n5j1cAmjF1hsfWGzdurBYvWmzG4esuX758YK4DkG76sWgbNm1QeXl5qm7duoFz2TtA995zr7fviFEjvHUWLlwY2N/WmzWPfU/buTbszWGBee3atVWLFi3EfvrurH9+OAHIX/Pvq6/b3pUtKCjw9mnUqJH6ZPYnZrx7927T2++r8LlqVKlhev2HH91Xq1bN9Dq0tT+vverQoUPg/FpGRoZ5jPVOqGcCkK1nrc5SO3fu3H8dvgC0bu26wHk1vYad++8A+etJRhQAZ2r/ubnzF+54878Q6FajRg21cmXsRdFu8+9TUgD60+A/qRtuuCGwb3gffwDyX8OhBCD/PCM9wws4h3MHKJGFA1DWmizTjx8/3vSNGsbeLE5qcJKaPDH2NdR343Tvf37S09O98ddff216fwAqXy4WCrSn/vxU4PiS+uzsbO+YQxGvABSu2eubM2dOYG57/Ubsn9sAFF5Hs2/wmg1Ad99zd2Afe2xJAahVq1aBuTZ48GBvPmrEqGKPs+N3/vmONx8wYIDYz7+/drAA5K9v3LIxUJ88KfY9tC83dudWf18Vd3zLFsGQXbVqVdNv3x67a6U9+uij3viUk/d/DC4CUFaW+mnbT97cH4D03Uf/eR76/UOBuQ1A1193faCeZEQBcMr1C3e8DfjjAPNi4H9B0H+a0m3c+HFm7t9WXACyze5j25WXXxnY1wYg/z76TaakAGTH4XX9dd1SUlLUzz//bMYrlq8wdzf8az33zHNmrG+J+9dLJDoA2aY/lrntjtvMeMiQIWb76u9Xm7n+/Sk9101/PezYv5ZtDzzwgJmH7wBt3rTZbN+6Zau3f+tWrU3Qsc3W9fluuy12LfaO0sEcqwB08803m+uaOnWqmfuvW/c61Nhm1ijmI7Arr7jSjO0bsGW3+/e1fXEBSLec3P2/52ab/zg7Hv9uLNT66wsXB9f0r9G2beyjMf/+WnEBqE+fPt5+tumxDUBXXHGFqQ0fPtzM7773bjO/5+57zHxN1ho1ffp077ivvvrKjFudHgt34QBkm/8adMvNzTXBKByA7Hb9Bxx/ABo2fFhgLX+z8+LqSUYUAKf0C3eNh5qKeqJK0hcSxFE8AlCUufgZcrEGEp4oAE6VOz49qV68AdeSLQABx4goAM7pF29ewIEjQwAC4kIUgLggBAFHhgAExIUoAHFjQ1CDSeeIbUhep/zQxXxfpFSO/cOSCDplTez5KZ/56/+DgkACEQUgrsqklvWCkHXykk6q/ui2qk6/+nETPicOT/j5dKX5+q7H5DylVbPvO/P8IFLCr+mlmCgAx9TJyy5RzTfIN1wAQPSEX8NLMVEAElP1Cjga4efTIfvC2ujjDmIb9j8/TeZdJLYBOGKiAACIEH4JGogLUQAARAgBCIgLUQAARAgBCIgLUQAARAgBCIgLUQAARAgBCIgLUQAARAgBCIgLUQAARAgBCIgLUQAARAgBCIgLUQAARAgBCIgLUQAARAgBCIgLUQAARAgBCIgLUQAARAgBCIgLUQAARAgBCIgLUQAARAgBCIgLUQAARAgBCIgLUQAARAgBCIgLUQAARAgBCIgLUQAARAgBCIgLUQAARAgBCIgLUQAARAgBCIgLUQAAREhK1egFoHPOPUfUDkf9+vVFza9d23aidjCTJ08O9EejU8dOonYwR3reIU8PEbUou+P2O0StlBIFAECElEkv6zwA1atXT6kiJep++fn5omZdddVVonY4mjVvJmp+nS/tLGoHo5u/Pxo39LpB1LKzs0XNL3ze8Dxs+Mjhpp86Y6rYFkX28dx7971iWyklCgCAiIlHAGrapKmqXr26V+vQoYN6cvCTqrCw0Mx1f9/993nbdet2bTe1/sf1JgBt2bJFLVy40Ns+b948tfCr2Hzzls1q8eLFZqyD1CsvvaIqZlRUPXr2UM89+5wIB7rdd999Xl0HoIyMDDVlyhT18EMPqwEDBsTWKshXb41+S514wokqNS1VDRs+TO3cudNbw/bZe2JhZdToUYHzPP3U094+V19zdeCYntf3VOvXrzdzHYAaNGygHh/4uMrLyzO13Nxc83xUqlRJDR823AuIuvW5uY+3lqb3063eCfXUhg0b1PU9rhfbV327yjv+ln63qPXrYufO3p2tZnw0I3DduvXu1VtNnhK7y6Rb35v7Bp7jv//972rjlo3qlr63qH379pm6vvaRI0eq0047zcw3b96spk2bptLS0sxay5ctVxs3bDTbxowdo3rf2Nu7Dt3u/939ptdfd92OO/44b9s13a7xnnttd/ZudcXlV5hter5nzx711oi3zPjSyy5VAwcNVG+PeVvVqllL9e/fXy35zxLv3NWqVVOvvfqa9713jIgCACBi4hGAdG/frMJjfYcmfAeosKBQPf7Hx824uDtAbw5/U61du1ZVq1HNBCBdy8zMVFPen2LYZtcPH6/Z7ToAlXRt/vnESRPNOf012+uQFD7OBqD8vHz11OCnAtu0XTt2md7eAZr18Sy16+dYzd4B0s0+Jj1/f/L7gfNadq6DYvg8WvgOkG7PPPuMt/Z7/3pPHKNt3BgLDZp+HP5ty5cu99by13WbM3dOYG7DlL9mz92qdStvjR3bd4g19ffGk4OeDBz/7Ypv1T//+U8z7tK1i1jbP9YByM51cPaf239cnIkCACBidABKqVZe1I+UDUBaTm6O6f1vUqmpqSIAvTHsDW+/cAC69ZZbvbE/AOk7Df797Dnatm0bqD828LHAdh2A/Of3X5u27adtavpH04td299f2PHCwD42AI0YNcL0Tz0dC0F/feGvgWN1ALLjG//nRtP7A5B/za1btxZbt3Pbv/b6a4HtxQWg1q1aB/ax+g+IBYYv532pJkyYoK7rfl1gbetAAei3XX7rzffm7C02ABU3Ly4ADRsxTNTs70DppoOvrX/62aeB/fLy8wIBaPDTgwPbjyFRAABEjA5ALu8C+QPQue3P9ca6DXpyUGBux02aNDHzlJQUEYDsvqe2OlU99NBDXgDS/jjgj4F1dMtIzwgce+1V1ypVaDaZuf0doPzc/MCxmbUyxVqVq1T2xv5+3PhxgblmA9CJJ8buDr308ktmrj+W0a1MmTJmbu8A6VahQoXA+XRfkFegVmXFPsLSH9/oVlBQ4O2n6btT1117nVlTtzp16gS229/B8gcg3c+aMcsbWzVr1gzUWp/eWuyjhQNQ7czagf0WLVqk9uXGPh4LByB7nN3f9jYA6Y8jr/7vq824YYOGZnu5cuW8Y/XzpFvVqlXN/MMPP/TWsOsVFMaeIx2Ann3+WVVUVORt13cYl38bu/5jRBQAABHkMgBFjW5fzv9S9enXR2w7EkP/MdT8zo4ed+p0+H+jC/HlvwP0KxIFAEAEub4LBCQ5UQAARJQOQHWeKP4XiAEcFlEAAERV2VgIOvm7/b/QCuCIiAIAIOLsx2GNP7tAbANwSEQBAFAKpNSI/RcZQDIK/zwcAVEAAJRC1a47XtUfe6Zq8MF5qvFHQGILf/8fAVEAAABIdKIAAACQ6EQBAAAg0YkCAABAohMFAACARCcKAAAAiU4UAAAAEp0oAAAAJDpRAAAASHSiAAAAkOhEAQAAINGJAgAAQKITBQAAgEQnCgAAAIlOFAAAABKdKAAAACQ6UQAAAEh0ogAAAJDoRAEAACDRiQIAAECiEwUAAIBEJwoAAACJThQAAAASnSgAAAAkOlEAAABIdKIAAACQ6EQBAAAg0YkCAABAohMFAACARCcKAAAAiU4UAAAAEp0oAAAAJDpRAAAASHSiAAAAkOhEAQAAINGJAgAAQKITBQAAgEQnCgAAAIlOFAAAABKdKAAAACQ6UQAAAEh0ogAAAJDoRAEAACDRiQIAAECiEwUAAIBEJwoAAACJThQAAAASnSgAAAAkOlEAAABIdKIAAACQ6EQBAAAg0YkCAABAohMFAACARCcKAAAAiU4UAAAAEp0oAAAAJDpRAAAASHSiAAAAkOhEAQAAINGJAgAAQKITBQAAgEQnCgAAAIlOFAAAABLa/wecHdh7wjzaRgAAAABJRU5ErkJggg==>

[image2]: <data:image/png;base64,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>