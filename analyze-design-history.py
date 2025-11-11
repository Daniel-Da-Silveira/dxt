#!/usr/bin/env python3
"""
Analyze design history files to extract statistics for DDAT capability framework.
"""

import os
import re
import sys
from collections import defaultdict
from pathlib import Path

def extract_variable(content, var_name):
    """Extract values from nunjucks variable declarations."""
    # Can't use backslashes in f-strings, so build patterns manually
    pattern1 = '{%\\s*set\\s+' + var_name + '\\s*=\\s*\\[(.*?)\\]%}'
    pattern2 = '{%\\s*set\\s+' + var_name + '\\s*=\\s*"(.*?)"%}'
    pattern3 = '{%\\s*set\\s+' + var_name + '\\s*=\\s*"(.*?)"\\s*%}'
    patterns = [pattern1, pattern2, pattern3]
    for pattern in patterns:
        matches = re.findall(pattern, content, re.DOTALL)
        if matches:
            return matches
    return []

def count_research_rounds(content):
    """Count research rounds from researchRounds array."""
    rounds = extract_variable(content, 'researchRounds')
    if rounds:
        # Count items in the array
        items = re.findall(r'"([^"]+)"', rounds[0])
        return len(items)
    return 0

def count_research_history_entries(content):
    """Count entries in researchHistory table."""
    # Look for roundNumber pattern in researchHistory
    matches = re.findall(r'roundNumber:\s*"([^"]+)"', content)
    return len(matches)

def extract_research_summaries(content):
    """Extract research summaries count."""
    matches = re.findall(r'title:\s*"(Round \d+[^"]*)"', content)
    return matches

def has_accessibility_mentions(content):
    """Check for accessibility-related mentions."""
    a11y_keywords = [
        'accessibility', 'accessible', 'screen reader', 'WCAG', 
        'ARIA', 'keyboard', 'focus', 'a11y', 'designed for everyone'
    ]
    content_lower = content.lower()
    return any(keyword in content_lower for keyword in a11y_keywords)

def has_user_quotes(content):
    """Check for user quotes in research summaries."""
    quote_patterns = [
        r'type:\s*"quotes"',
        r'Participant \d+',
        r'"[^"]*" - [^"]+',
    ]
    return any(re.search(pattern, content, re.IGNORECASE) for pattern in quote_patterns)

def has_findings(content):
    """Check for research findings."""
    return 'type:\s*"findings"' in content or 'type: "findings"' in content

def has_objectives(content):
    """Check for research objectives."""
    return 'type:\s*"objectives"' in content or 'type: "objectives"' in content

def has_recommendations(content):
    """Check for recommendations."""
    return 'type:\s*"recommendations"' in content or 'type: "recommendations"' in content

def extract_status(content):
    """Extract feature status."""
    match = re.search(r'status\s*=\s*"([^"]+)"', content)
    return match.group(1) if match else None

def extract_phase(content):
    """Extract phase."""
    match = re.search(r'phase\s*=\s*"([^"]+)"', content)
    return match.group(1) if match else None

def extract_user_need(content):
    """Extract user need statement."""
    match = re.search(r'userNeed\s*=\s*"(.*?)"', content, re.DOTALL)
    return match.group(1).strip() if match else None

def analyze_design_history():
    """Analyze all design history files."""
    base_path = Path('app/views/design-history')
    features = []
    
    # Find all index.html files in design-history subdirectories
    for index_file in base_path.rglob('index.html'):
        # Skip the main index.html at the root
        if index_file.parent != base_path:
            try:
                content = index_file.read_text(encoding='utf-8')
                
                feature_name_vars = extract_variable(content, 'featureName')
                if feature_name_vars:
                    # Handle both array and string formats
                    if isinstance(feature_name_vars, list) and feature_name_vars:
                        feature_name = feature_name_vars[0].strip('"\'')
                    else:
                        feature_name = str(feature_name_vars).strip('"\'')
                else:
                    feature_name = index_file.parent.name.replace('-', ' ').title()
                
                rounds_count = count_research_rounds(content)
                history_count = count_research_history_entries(content)
                summaries = extract_research_summaries(content)
                
                # Use the maximum of rounds count and history count
                iterations = max(rounds_count, history_count, len(summaries)) if max(rounds_count, history_count, len(summaries)) > 0 else 1
                
                features.append({
                    'name': feature_name,
                    'path': str(index_file.relative_to(base_path.parent)),
                    'rounds': rounds_count,
                    'history_entries': history_count,
                    'summaries_count': len(summaries),
                    'iterations': iterations,
                    'has_accessibility': has_accessibility_mentions(content),
                    'has_quotes': has_user_quotes(content),
                    'has_findings': has_findings(content),
                    'has_objectives': has_objectives(content),
                    'has_recommendations': has_recommendations(content),
                    'status': extract_status(content),
                    'phase': extract_phase(content),
                    'has_user_need': extract_user_need(content) is not None,
                })
            except Exception as e:
                print(f"Error processing {index_file}: {e}", file=sys.stderr)
    
    return features

def generate_statistics(features):
    """Generate statistics from features."""
    stats = {
        'total_features': len(features),
        'total_iterations': sum(f['iterations'] for f in features),
        'features_with_multiple_iterations': len([f for f in features if f['iterations'] > 1]),
        'features_with_accessibility': len([f for f in features if f['has_accessibility']]),
        'features_with_quotes': len([f for f in features if f['has_quotes']]),
        'features_with_findings': len([f for f in features if f['has_findings']]),
        'features_with_objectives': len([f for f in features if f['has_objectives']]),
        'features_with_recommendations': len([f for f in features if f['has_recommendations']]),
        'features_with_user_needs': len([f for f in features if f['has_user_need']]),
        'status_breakdown': defaultdict(int),
        'phase_breakdown': defaultdict(int),
        'iteration_distribution': defaultdict(int),
    }
    
    for feature in features:
        if feature['status']:
            stats['status_breakdown'][feature['status']] += 1
        if feature['phase']:
            stats['phase_breakdown'][feature['phase']] += 1
        stats['iteration_distribution'][feature['iterations']] += 1
    
    return stats, features

def print_report(stats, features):
    """Print comprehensive statistics report."""
    print("=" * 80)
    print("DESIGN HISTORY STATISTICS FOR DDAT CAPABILITY FRAMEWORK")
    print("=" * 80)
    print()
    
    total_features = stats['total_features']
    if total_features == 0:
        print("No features found. Please check the file paths.")
        return
    
    print("1. DESIGN COMMUNICATION")
    print("-" * 80)
    print(f"Total features documented: {total_features}")
    print(f"Features with documented user needs: {stats['features_with_user_needs']} ({stats['features_with_user_needs']/total_features*100:.1f}%)")
    print(f"Features with research objectives: {stats['features_with_objectives']}")
    print(f"Features with documented findings: {stats['features_with_findings']} ({stats['features_with_findings']/total_features*100:.1f}%)")
    print(f"Features with recommendations: {stats['features_with_recommendations']}")
    print(f"Features with user quotes: {stats['features_with_quotes']}")
    print()
    
    print("2. DESIGNING FOR EVERYONE")
    print("-" * 80)
    print(f"Features with accessibility considerations: {stats['features_with_accessibility']} ({stats['features_with_accessibility']/total_features*100:.1f}%)")
    print()
    
    print("3. DESIGNING STRATEGICALLY")
    print("-" * 80)
    print(f"Features with user needs defined: {stats['features_with_user_needs']} ({stats['features_with_user_needs']/total_features*100:.1f}%)")
    print("\nPhase breakdown:")
    for phase, count in sorted(stats['phase_breakdown'].items()):
        print(f"  - {phase}: {count}")
    print("\nStatus breakdown:")
    for status, count in sorted(stats['status_breakdown'].items()):
        print(f"  - {status}: {count}")
    print()
    
    print("4. EVIDENCE-BASED DESIGN")
    print("-" * 80)
    print(f"Total research iterations across all features: {stats['total_iterations']}")
    print(f"Features with multiple iterations: {stats['features_with_multiple_iterations']} ({stats['features_with_multiple_iterations']/stats['total_features']*100:.1f}%)")
    print(f"Features with documented findings: {stats['features_with_findings']}")
    print(f"Features with user quotes: {stats['features_with_quotes']}")
    print()
    
    print("5. ITERATIVE DESIGN")
    print("-" * 80)
    print(f"Total iterations across all features: {stats['total_iterations']}")
    print(f"Average iterations per feature: {stats['total_iterations']/stats['total_features']:.1f}")
    print(f"Features with 2+ iterations: {stats['features_with_multiple_iterations']} ({stats['features_with_multiple_iterations']/total_features*100:.1f}%)")
    print(f"Features with 3+ iterations: {len([f for f in features if f['iterations'] >= 3])}")
    print(f"Features with 4+ iterations: {len([f for f in features if f['iterations'] >= 4])}")
    print("\nIteration distribution:")
    for iters in sorted(stats['iteration_distribution'].keys()):
        count = stats['iteration_distribution'][iters]
        print(f"  - {iters} iteration(s): {count} feature(s)")
    print()
    
    print("6. FEATURES BY ITERATION COUNT")
    print("-" * 80)
    # Sort by iterations descending
    features_sorted = sorted(features, key=lambda x: x['iterations'], reverse=True)
    for feature in features_sorted[:20]:  # Top 20
        print(f"  {feature['name']}: {feature['iterations']} iteration(s)")

if __name__ == '__main__':
    features = analyze_design_history()
    stats, features = generate_statistics(features)
    print_report(stats, features)

