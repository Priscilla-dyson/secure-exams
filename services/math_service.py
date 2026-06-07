"""
Math Service for Secure Exams System.
Uses SymPy for symbolic mathematics computation.
Provides WolframAlpha-style computation and display.

Usage:
    python services/math_service.py <operation> <expression> [options]

Operations:
    simplify    - Simplify a mathematical expression
    solve       - Solve an equation
    derive      - Differentiate an expression
    integrate   - Integrate an expression
    evaluate    - Evaluate with variable values
    compare     - Compare two expressions for equivalence

Dependencies:
    pip install sympy
"""

import sympy as sp
from sympy.parsing.latex import parse_latex
import json
import sys
import re


class MathService:
    """Mathematical computation service using SymPy."""

    @staticmethod
    def simplify(expression: str) -> dict:
        """Simplify a mathematical expression.
        
        Args:
            expression: LaTeX string (e.g. "x^2 + 2x + 1")
            
        Returns:
            dict with input, result (LaTeX), result_text, steps
        """
        try:
            expr = parse_latex(expression)
            simplified = sp.simplify(expr)
            
            # Generate step-by-step
            steps = []
            steps.append(f"Input: ${expression}$")
            steps.append(f"Expression parsed as: ${sp.latex(expr)}$")
            steps.append(f"Simplified: ${sp.latex(simplified)}$")
            
            # Check for factorization
            try:
                factored = sp.factor(expr)
                if factored != expr and factored != simplified:
                    steps.append(f"Factored form: ${sp.latex(factored)}$")
            except Exception:
                pass
            
            # Check for expansion
            try:
                expanded = sp.expand(expr)
                if expanded != expr and expanded != simplified:
                    steps.append(f"Expanded form: ${sp.latex(expanded)}$")
            except Exception:
                pass
            
            return {
                'success': True,
                'input': expression,
                'result': sp.latex(simplified),
                'result_text': str(simplified),
                'steps': steps
            }
        except Exception as e:
            return {
                'success': False,
                'error': f"Failed to parse or simplify: {str(e)}",
                'input': expression
            }

    @staticmethod
    def solve(equation: str, variable: str = 'x') -> dict:
        """Solve an equation for a variable.
        
        Args:
            equation: LaTeX string (e.g. "x^2 - 4 = 0")
            variable: Variable to solve for
            
        Returns:
            dict with solutions, steps
        """
        try:
            expr = parse_latex(equation)
            
            # Handle equations (expr - rhs = 0)
            solutions = sp.solve(expr, sp.Symbol(variable))
            
            # Generate steps
            steps = []
            steps.append(f"Equation: ${equation}$")
            
            if len(solutions) == 0:
                steps.append("No solutions found")
                return {
                    'success': True,
                    'input': equation,
                    'variable': variable,
                    'solutions': [],
                    'steps': steps,
                    'message': 'No solutions found'
                }
            
            steps.append(f"Rearranging to solve for ${variable}$:") 
            steps.append(f"Set expression = 0")
            
            # Try to show rearrangement
            try:
                expanded = sp.expand(expr)
                if expanded != expr:
                    steps.append(f"Expand: ${sp.latex(expanded)} = 0$")
            except Exception:
                pass
            
            solution_strs = []
            for sol in solutions:
                sol_latex = sp.latex(sol)
                solution_strs.append(sol_latex)
                steps.append(f"${variable} = {sol_latex}$")
            
            return {
                'success': True,
                'input': equation,
                'variable': variable,
                'solutions': solution_strs,
                'solutions_text': [str(sol) for sol in solutions],
                'steps': steps
            }
        except Exception as e:
            return {
                'success': False,
                'error': f"Failed to solve: {str(e)}",
                'input': equation
            }

    @staticmethod
    def differentiate(expression: str, variable: str = 'x') -> dict:
        """Differentiate an expression.
        
        Args:
            expression: LaTeX string
            variable: Variable to differentiate with respect to
            
        Returns:
            dict with derivative, steps
        """
        try:
            expr = parse_latex(expression)
            derivative = sp.diff(expr, sp.Symbol(variable))
            
            steps = []
            steps.append(f"Expression: ${expression}$")
            steps.append(f"Differentiating with respect to ${variable}$:")
            steps.append(f"$\\frac{{d}}{{d{variable}}} \\left( {sp.latex(expr)} \\right)$")
            steps.append(f"Result: ${sp.latex(derivative)}$")
            
            # Try to simplify the derivative
            simplified = sp.simplify(derivative)
            if simplified != derivative:
                steps.append(f"Simplified: ${sp.latex(simplified)}$")
            
            return {
                'success': True,
                'input': expression,
                'variable': variable,
                'result': sp.latex(simplified),
                'result_text': str(simplified),
                'steps': steps
            }
        except Exception as e:
            return {
                'success': False,
                'error': f"Failed to differentiate: {str(e)}",
                'input': expression
            }

    @staticmethod
    def integrate(expression: str, variable: str = 'x') -> dict:
        """Integrate an expression.
        
        Args:
            expression: LaTeX string
            variable: Variable to integrate with respect to
            
        Returns:
            dict with integral, steps
        """
        try:
            expr = parse_latex(expression)
            integral = sp.integrate(expr, sp.Symbol(variable))
            
            steps = []
            steps.append(f"Expression: ${expression}$")
            steps.append(f"Integrating with respect to ${variable}$:")
            steps.append(f"$\\int {sp.latex(expr)} \\, d{variable}$")
            steps.append(f"Result: ${sp.latex(integral)} + C$")
            
            return {
                'success': True,
                'input': expression,
                'variable': variable,
                'result': sp.latex(integral),
                'result_text': str(integral),
                'indefinite': f"{sp.latex(integral)} + C",
                'steps': steps
            }
        except Exception as e:
            return {
                'success': False,
                'error': f"Failed to integrate: {str(e)}",
                'input': expression
            }

    @staticmethod
    def evaluate(expression: str, substitutions: dict) -> dict:
        """Evaluate an expression with given variable values.
        
        Args:
            expression: LaTeX string
            substitutions: dict of {variable: value}
            
        Returns:
            dict with evaluated result
        """
        try:
            expr = parse_latex(expression)
            
            steps = []
            steps.append(f"Expression: ${expression}$")
            
            subs_str = ", ".join([f"${k} = {v}$" for k, v in substitutions.items()])
            steps.append(f"Substituting: {subs_str}")
            
            sym_subs = {sp.Symbol(k): float(v) for k, v in substitutions.items()}
            result = expr.subs(sym_subs)
            numerical = float(result.evalf())
            
            steps.append(f"Result: ${sp.latex(result)}$")
            steps.append(f"Numerical: ${numerical}$")
            
            return {
                'success': True,
                'input': expression,
                'substitutions': substitutions,
                'result': numerical,
                'result_latex': sp.latex(result),
                'steps': steps
            }
        except Exception as e:
            return {
                'success': False,
                'error': f"Failed to evaluate: {str(e)}",
                'input': expression
            }

    @staticmethod
    def compare_answers(student_answer: str, correct_answer: str, tolerance: float = 0.01) -> dict:
        """Compare two mathematical expressions for equivalence.
        Used for automatic marking of math questions.
        
        Args:
            student_answer: Student's answer in LaTeX
            correct_answer: Correct answer in LaTeX
            tolerance: Numerical tolerance for evaluation comparison
            
        Returns:
            dict with correct (bool), confidence (float 0-1), details
        """
        try:
            student_expr = parse_latex(student_answer)
            correct_expr = parse_latex(correct_answer)
            
            details = []
            
            # Check if they're mathematically equivalent
            difference = sp.simplify(student_expr - correct_expr)
            details.append(f"Difference (simplified): ${sp.latex(difference)}$")
            
            if difference == 0:
                return {
                    'correct': True,
                    'confidence': 1.0,
                    'method': 'symbolic',
                    'details': details
                }
            
            # Try numerical evaluation with random test points
            variables = list(student_expr.free_symbols | correct_expr.free_symbols)
            if variables:
                import random
                matches = 0
                trials = 10
                test_values = []
                for _ in range(trials):
                    subs = {v: random.uniform(-10, 10) for v in variables}
                    try:
                        sv = float(student_expr.evalf(subs=subs))
                        cv = float(correct_expr.evalf(subs=subs))
                        diff = abs(sv - cv)
                        is_match = diff < tolerance
                        if is_match:
                            matches += 1
                        test_values.append({
                            'substitutions': {str(k): float(subs[k]) for k in subs},
                            'student_value': sv,
                            'correct_value': cv,
                            'difference': diff,
                            'match': is_match
                        })
                    except Exception as e:
                        details.append(f"Evaluation error at test point: {str(e)}")
                
                confidence = matches / trials
                details.append(f"Numerical tests: {matches}/{trials} matched (confidence: {confidence:.2%})")
                
                return {
                    'correct': confidence > 0.8,
                    'confidence': confidence,
                    'method': 'numerical',
                    'details': details,
                    'test_samples': test_values
                }
            
            return {
                'correct': False,
                'confidence': 0.0,
                'method': 'symbolic',
                'details': details + ['Expressions are not mathematically equivalent']
            }
        except Exception as e:
            return {
                'correct': False,
                'confidence': 0.0,
                'error': f"Comparison error: {str(e)}",
                'details': []
            }


def main():
    """CLI interface for MathService."""
    if len(sys.argv) < 3:
        print(json.dumps({
            'error': 'Usage: python math_service.py <operation> <expression> [options]',
            'available_operations': ['simplify', 'solve', 'derive', 'integrate', 'evaluate', 'compare']
        }))
        sys.exit(1)
    
    operation = sys.argv[1]
    expression = sys.argv[2]
    
    service = MathService()
    
    if operation == 'simplify':
        result = service.simplify(expression)
    elif operation == 'solve':
        variable = sys.argv[3] if len(sys.argv) > 3 else 'x'
        result = service.solve(expression, variable)
    elif operation == 'derive':
        variable = sys.argv[3] if len(sys.argv) > 3 else 'x'
        result = service.differentiate(expression, variable)
    elif operation == 'integrate':
        variable = sys.argv[3] if len(sys.argv) > 3 else 'x'
        result = service.integrate(expression, variable)
    elif operation == 'evaluate':
        try:
            substitutions = json.loads(sys.argv[3]) if len(sys.argv) > 3 else {}
        except json.JSONDecodeError:
            substitutions = {}
        result = service.evaluate(expression, substitutions)
    elif operation == 'compare':
        correct = sys.argv[3] if len(sys.argv) > 3 else ''
        tolerance = float(sys.argv[4]) if len(sys.argv) > 4 else 0.01
        result = service.compare_answers(expression, correct, tolerance)
    else:
        result = {'error': f'Unknown operation: {operation}'}
    
    print(json.dumps(result, default=str))


if __name__ == '__main__':
    main()