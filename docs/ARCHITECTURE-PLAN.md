# Secure Exams System - Architecture Improvement Plan

## 1. RBAC & Department Role System Redesign

### Current Problems:
- `department` is a raw string on User model (weak)
- `isHod` is a simple boolean without governance
- No Department model exists
- Lecturers are assigned to modules directly by admin
- No Department → HOD → Lecturer assignment chain

### New Model Structure:

```prisma
// ADD to schema.prisma:

enum UserRole {
  STUDENT
  LECTURER
  ADMIN
}

model Department {
  id          String      @id @default(cuid())
  name        String      @unique
  code        String      @unique  // e.g. "ICT", "NURSING"
  description String?
  isActive    Boolean     @default(true)
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt

  hodId       String?
  hod         User?       @relation("DepartmentHOD", fields: [hodId], references: [id])
  lecturers   User[]      @relation("DepartmentLecturer")
  programs    Program[]

  @@index([name])
  @@index([hodId])
}

// MODIFY User model:
// - Remove: department String?
// - Remove: isHod Boolean
// - Add: departmentId String?
// - Add: department Department? @relation("DepartmentLecturer")
// - Add: hodDepartment Department? @relation("DepartmentHOD")

// MODIFY Program model:
// - Add: departmentId String
// - Add: department Department @relation(fields: [departmentId], references: [id])
```

### RBAC Rules:

| Role | Permissions |
|------|------------|
| ADMIN | - Manage departments (CRUD)<br>- Assign HODs to departments<br>- View all users/system data<br>- System configuration |
| HOD | - Manage lecturers in their department<br>- Assign lecturers to modules within their department<br>- View department analytics<br>- Oversee exams in their department |
| LECTURER | - Create/manage exams for assigned modules<br>- Grade student answers<br>- View results for their modules |
| STUDENT | - Take exams<br>- View own results<br>- View own profile |

### Permission Flow:
```
ADMIN
  └── Creates Department "ICT"
  └── Assigns User A as HOD of "ICT"
        └── HOD creates/assigns Lecturer B, C, D to "ICT"
              └── HOD assigns Lecturer B to Module "Networking 101"
                    └── Lecturer B creates exam for "Networking 101"
                          └── Students in "Networking 101" class take exam
```

## 2. Question Management System Redesign

### Current Problems:
- Question tied directly to Exam (no reusable question bank)
- No parent-child (sub-question) support
- Question type and subject mixed in single enum
- No subject/category separation
- No auto-marking metadata

### New Model Structure:

```prisma
// ADD to schema.prisma:

enum QuestionCategory {
  MULTIPLE_CHOICE
  TRUE_FALSE
  SHORT_ANSWER
  ESSAY
  MATH
  STRUCTURED  // parent container for sub-questions
}

model Subject {
  id          String      @id @default(cuid())
  name        String
  code        String      @unique  // e.g. "MATH101", "PHYS101"
  description String?
  departmentId String
  department  Department  @relation(fields: [departmentId], references: [id])
  isActive    Boolean     @default(true)
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt

  questions   Question[]

  @@index([departmentId])
  @@index([code])
}

model Question {
  id              String           @id @default(cuid())
  category        QuestionCategory
  subjectId       String?
  subject         Subject?         @relation(fields: [subjectId], references: [id])
  text            String           // Question text (can include LaTeX)
  plainText       String?          // Plain text version for search
  instructions    String?
  marks           Int              @default(1)
  difficulty      Int              @default(1) // 1-5 scale
  imageUrl        String?
  requiresManualMarking Boolean   @default(false)
  
  // Parent-child for sub-questions (STRUCTURED)
  parentId        String?
  parent          Question?        @relation("SubQuestions", fields: [parentId], references: [id])
  subQuestions    Question[]       @relation("SubQuestions")
  order           Int?             // Order within parent

  // For MCQ/TrueFalse
  options         QuestionOption[]

  // For auto-marking
  correctAnswer   String?          // Plain text answer
  mathAnswer      String?          // LaTeX answer
  tolerance       Float?           // Numerical tolerance for math answers
  caseSensitive   Boolean          @default(false)
  maxLength       Int?             // Max characters for short answer

  // Auto-marking rules
  markingRules    Json?            // Flexible JSON rules for advanced marking

  // Usage tracking
  timesUsed       Int              @default(0)
  lastUsedAt      DateTime?

  creatorId       String
  creator         User             @relation(fields: [creatorId], references: [id])
  isActive        Boolean          @default(true)
  createdAt       DateTime         @default(now())
  updatedAt       DateTime         @updatedAt

  // Relations
  exams           ExamQuestion[]
  answers         StudentAnswer[]

  @@index([subjectId])
  @@index([creatorId])
  @@index([category])
  @@index([parentId])
  @@index([isActive])
}

model ExamQuestion {
  id          String      @id @default(cuid())
  examId      String
  exam        Exam        @relation(fields: [examId], references: [id], onDelete: Cascade)
  questionId  String
  question    Question    @relation(fields: [questionId], references: [id])
  marks       Int         @default(1)
  order       Int
  isRequired  Boolean     @default(true)
  createdAt   DateTime    @default(now())

  @@unique([examId, questionId])
  @@index([examId])
  @@index([questionId])
}

// MODIFY: Keep QuestionOption but add trueFalse answer field
model QuestionOption {
  id          String   @id @default(cuid())
  questionId  String
  question    Question @relation(fields: [questionId], references: [id], onDelete: Cascade)
  text        String
  isCorrect   Boolean  @default(false)
  order       Int

  @@index([questionId])
}

// MODIFY StudentAnswer - add auto-marked fields
model StudentAnswer {
  id              String      @id @default(cuid())
  attemptId       String
  attempt         ExamAttempt @relation(fields: [attemptId], references: [id], onDelete: Cascade)
  questionId      String
  question        Question    @relation(fields: [questionId], references: [id])
  studentId       String
  student         User        @relation(fields: [studentId], references: [id])
  
  answer          String?
  selectedOptionId String?
  drawingImage    String?
  
  // Auto-marking results
  autoMarked      Boolean     @default(false)
  autoMarkScore   Float?      // Score from auto-marking (0.0 to 1.0 normalized)
  autoMarkDetails Json?       // Detailed auto-marking results
  
  marks           Int?
  isCorrect       Boolean?
  graderId        String?     // Who manually graded
  graderComment   String?
  
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt

  @@index([attemptId])
  @@index([questionId])
  @@index([studentId])
  @@index([autoMarked])
}
```

### Question Category Design:

| Category | Auto-Markable? | Storage |
|----------|---------------|---------|
| MULTIPLE_CHOICE | ✅ Yes | Compare selectedOptionId with correct option |
| TRUE_FALSE | ✅ Yes | Compare boolean answer |
| SHORT_ANSWER | ✅ Semi | Fuzzy string matching, keyword detection |
| ESSAY | ❌ Manual | Stored for manual grading |
| MATH | ✅ Yes | LaTeX comparison with tolerance for numerical |
| STRUCTURED | Depends | Container: auto-mark sub-questions individually |

### Question Bank Architecture:
- Questions stored independently (not tied to exams)
- Exams reference questions via ExamQuestion junction table
- Questions can be reused across exams
- Each question has a Subject (Mathematics, Physics, etc.)
- A MATH question can be MCQ (e.g., "Select the correct derivative")
- Sub-questions use parentId for hierarchy

## 3. Math Display Improvement (WolframAlpha-style)

### Current: Basic LaTeX rendering (poor display)
### Proposed: SymPy + MathJax/KaTeX + optional WolframAlpha API

### Backend Architecture (Python):

```python
# services/math_service.py
"""
Math service using SymPy for computation + rendering.
Optional WolframAlpha API integration.
"""

import sympy as sp
from sympy.parsing.latex import parse_latex
import json
import re

class MathService:
    @staticmethod
    def simplify(expression: str) -> dict:
        """Simplify a mathematical expression."""
        try:
            expr = parse_latex(expression)
            simplified = sp.simplify(expr)
            return {
                'success': True,
                'input': expression,
                'result': sp.latex(simplified),
                'result_text': str(simplified)
            }
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    @staticmethod
    def solve(equation: str, variable: str = 'x') -> dict:
        """Solve an equation for a variable."""
        try:
            expr = parse_latex(equation)
            solutions = sp.solve(expr, sp.Symbol(variable))
            return {
                'success': True,
                'input': equation,
                'variable': variable,
                'solutions': [sp.latex(sol) for sol in solutions],
                'solutions_text': [str(sol) for sol in solutions]
            }
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    @staticmethod
    def differentiate(expression: str, variable: str = 'x') -> dict:
        """Differentiate an expression."""
        try:
            expr = parse_latex(expression)
            derivative = sp.diff(expr, sp.Symbol(variable))
            return {
                'success': True,
                'input': expression,
                'result': sp.latex(derivative),
                'result_text': str(derivative)
            }
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    @staticmethod
    def integrate(expression: str, variable: str = 'x') -> dict:
        """Integrate an expression."""
        try:
            expr = parse_latex(expression)
            integral = sp.integrate(expr, sp.Symbol(variable))
            return {
                'success': True,
                'input': expression,
                'result': sp.latex(integral),
                'result_text': str(integral)
            }
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    @staticmethod
    def evaluate(expression: str, substitutions: dict) -> dict:
        """Evaluate an expression with given variable values."""
        try:
            expr = parse_latex(expression)
            result = expr.subs({sp.Symbol(k): v for k, v in substitutions.items()})
            return {
                'success': True,
                'input': expression,
                'result': float(result.evalf()),
                'result_latex': sp.latex(result)
            }
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    @staticmethod
    def compare_answers(student_answer: str, correct_answer: str, tolerance: float = 0.01) -> dict:
        """Compare two mathematical expressions for equivalence."""
        try:
            student_expr = parse_latex(student_answer)
            correct_expr = parse_latex(correct_answer)
            
            # Check if they're mathematically equivalent
            difference = sp.simplify(student_expr - correct_expr)
            
            if difference == 0:
                return {'correct': True, 'confidence': 1.0}
            
            # Try numerical evaluation with random test points
            variables = list(student_expr.free_symbols | correct_expr.free_symbols)
            if variables:
                import random
                matches = 0
                trials = 10
                for _ in range(trials):
                    subs = {v: random.uniform(-10, 10) for v in variables}
                    try:
                        sv = float(student_expr.evalf(subs=subs))
                        cv = float(correct_expr.evalf(subs=subs))
                        if abs(sv - cv) < tolerance:
                            matches += 1
                    except:
                        pass
                confidence = matches / trials
                return {'correct': confidence > 0.8, 'confidence': confidence}
            
            return {'correct': False, 'confidence': 0.0}
        except Exception as e:
            return {'correct': False, 'confidence': 0.0, 'error': str(e)}
```

### Frontend Math Rendering:
- Replace basic LaTeX with **KaTeX** (fast, lightweight)
- Install: `npm install katex`  
- Use `react-katex` or custom KaTeX component
- WolframAlpha-style step-by-step via SymPy backend

### API Endpoint:
```typescript
// POST /api/math/evaluate
// Body: { expression: string, operation: 'simplify'|'solve'|'derive'|'integrate'|'evaluate' }
// Response: { success: boolean, input: string, result: string, steps?: string[] }
```

### Frontend MathInput Component:
```tsx
// components/MathInput.tsx
// Rich math input with:
// - Visual equation editor (palette-based)
// - LaTeX code editor with preview
// - WolframAlpha-style display with KaTeX
// - Step-by-step solution viewing
```

## 4. Implementation Order (Minimal Changes)

### Phase 1: Schema Changes
1. Add Department model
2. Modify User model (departmentId, remove raw department/isHod)
3. Add Subject model
4. Redesign Question model (add parentId, category, subjectId)
5. Add ExamQuestion junction table
6. Update StudentAnswer (autoMarked, autoMarkScore, etc.)

### Phase 2: API & Middleware
1. Department CRUD API routes
2. Subject CRUD API routes
3. Question Bank API (standalone question management)
4. Update auth middleware for department-based permissions
5. Math service Python endpoint

### Phase 3: Frontend
1. Admin: Department management UI
2. Admin: HOD assignment UI
3. Lecturer: Question bank UI
4. Update exam builder for new question types
5. MathInput component with KaTeX

### Phase 4: Auto-Marking Engine
1. MCQ/TrueFalse auto-marking
2. Math answer comparison
3. Short answer fuzzy matching
4. Sub-question aggregation