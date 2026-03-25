#!/usr/bin/env python3
"""
Markdown 代码块嵌套修复脚本

功能：
1. 检测 Markdown 文件中代码块内的三重反引号嵌套问题
2. 自动将外层代码块升级为四重反引号
3. 支持批量处理多个文件

使用方法：
    python fix_markdown_code_blocks.py <file1.md> [file2.md ...]
    python fix_markdown_code_blocks.py --dir content/posts
    python fix_markdown_code_blocks.py --help
"""

import argparse
import re
import sys
from pathlib import Path
from typing import List, Tuple, Optional
from dataclasses import dataclass


@dataclass
class CodeBlock:
    """代码块数据类"""
    start_line: int
    end_line: int
    backtick_count: int
    language: str
    content: str
    has_nested_backticks: bool


def find_code_blocks(content: str) -> List[CodeBlock]:
    """
    查找内容中的所有代码块
    
    Args:
        content: Markdown 文件内容
        
    Returns:
        CodeBlock 对象列表
    """
    blocks = []
    lines = content.split('\n')
    
    i = 0
    while i < len(lines):
        line = lines[i]
        
        # 匹配代码块开始标记（支持 3-6 个反引号）
        match = re.match(r'^(`{3,})\s*(\w*)\s*$', line)
        if match:
            backticks = match.group(1)
            language = match.group(2)
            backtick_count = len(backticks)
            start_line = i
            
            # 收集代码块内容
            code_lines = []
            i += 1
            found_end = False
            
            while i < len(lines):
                # 匹配相同数量的反引号作为结束标记
                end_pattern = r'^`{' + str(backtick_count) + r'}\s*$'
                if re.match(end_pattern, lines[i]):
                    found_end = True
                    break
                code_lines.append(lines[i])
                i += 1
            
            if found_end:
                code_content = '\n'.join(code_lines)
                
                # 检测代码块内部是否包含三重反引号
                has_nested = '```' in code_content
                
                blocks.append(CodeBlock(
                    start_line=start_line,
                    end_line=i,
                    backtick_count=backtick_count,
                    language=language,
                    content=code_content,
                    has_nested_backticks=has_nested
                ))
        
        i += 1
    
    return blocks


def fix_code_block(content: str, block: CodeBlock) -> str:
    """
    修复单个代码块，将外层反引号数量 +1
    
    Args:
        content: 原始内容
        block: 需要修复的代码块对象
        
    Returns:
        修复后的内容
    """
    lines = content.split('\n')
    
    # 新的反引号数量（当前数量 + 1）
    new_backtick_count = block.backtick_count + 1
    new_backticks = '`' * new_backtick_count
    
    # 创建新的开始和结束行
    if block.language:
        new_start_line = f"{new_backticks}{block.language}"
    else:
        new_start_line = new_backticks
    
    new_end_line = new_backticks
    
    # 替换开始和结束行
    lines[block.start_line] = new_start_line
    lines[block.end_line] = new_end_line
    
    return '\n'.join(lines)


def fix_markdown_file(file_path: Path, dry_run: bool = False) -> Tuple[bool, int, List[str]]:
    """
    修复单个 Markdown 文件
    
    Args:
        file_path: 文件路径
        dry_run: 如果为 True，只报告不修改
        
    Returns:
        (是否修改，修复数量，消息列表)
    """
    messages = []
    
    try:
        content = file_path.read_text(encoding='utf-8')
    except UnicodeDecodeError:
        messages.append(f"⚠️  无法读取文件（编码问题）: {file_path}")
        return False, 0, messages
    
    # 查找所有代码块
    code_blocks = find_code_blocks(content)
    
    if not code_blocks:
        messages.append(f"✓ 无需处理（无代码块）: {file_path}")
        return False, 0, messages
    
    # 找出需要修复的代码块（包含嵌套反引号的）
    blocks_to_fix = [b for b in code_blocks if b.has_nested_backticks]
    
    if not blocks_to_fix:
        messages.append(f"✓ 无需修复（无嵌套问题）: {file_path}")
        return False, 0, messages
    
    # 报告问题
    for block in blocks_to_fix:
        preview = block.content[:50].replace('\n', ' ')
        if len(block.content) > 50:
            preview += '...'
        messages.append(f"🔧 发现嵌套问题 (行 {block.start_line + 1}): {preview}")
    
    if dry_run:
        messages.append(f"ℹ️  干运行模式，未修改文件: {file_path}")
        return False, len(blocks_to_fix), messages
    
    # 修复所有问题代码块（从后往前修复，避免行号偏移）
    fixed_content = content
    for block in reversed(blocks_to_fix):
        fixed_content = fix_code_block(fixed_content, block)
    
    # 写回文件
    try:
        file_path.write_text(fixed_content, encoding='utf-8')
        messages.append(f"✅ 已修复 {len(blocks_to_fix)} 个问题：{file_path}")
        return True, len(blocks_to_fix), messages
    except Exception as e:
        messages.append(f"❌ 写入失败 {file_path}: {e}")
        return False, 0, messages


def find_markdown_files(path: Path) -> List[Path]:
    """
    递归查找所有 Markdown 文件
    
    Args:
        path: 文件或目录路径
        
    Returns:
        Markdown 文件路径列表
    """
    if path.is_file():
        if path.suffix.lower() in ['.md', '.markdown']:
            return [path]
        return []
    
    if path.is_dir():
        files = []
        for ext in ['*.md', '*.markdown']:
            files.extend(path.rglob(ext))
        return sorted(files)
    
    return []


def main():
    parser = argparse.ArgumentParser(
        description='修复 Markdown 代码块中的反引号嵌套问题',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog='''
示例:
  %(prog)s file.md                    # 处理单个文件
  %(prog)s file1.md file2.md          # 处理多个文件
  %(prog)s --dir content/posts        # 处理目录下所有 Markdown 文件
  %(prog)s --dir content --dry-run    # 预览模式，不实际修改
  %(prog)s --dir content --verbose    # 显示详细信息
        '''
    )
    
    parser.add_argument(
        'files',
        nargs='*',
        type=Path,
        help='要处理的 Markdown 文件'
    )
    
    parser.add_argument(
        '--dir', '-d',
        type=Path,
        dest='directory',
        help='要处理的目录（递归查找所有 .md 文件）'
    )
    
    parser.add_argument(
        '--dry-run', '-n',
        action='store_true',
        help='预览模式，只报告问题不修改文件'
    )
    
    parser.add_argument(
        '--verbose', '-v',
        action='store_true',
        help='显示详细输出'
    )
    
    args = parser.parse_args()
    
    # 收集所有要处理的文件
    files_to_process = []
    
    if args.files:
        for f in args.files:
            files_to_process.extend(find_markdown_files(f))
    
    if args.directory:
        files_to_process.extend(find_markdown_files(args.directory))
    
    if not files_to_process:
        print("❌ 未找到任何 Markdown 文件")
        print("使用 --help 查看使用方法")
        sys.exit(1)
    
    # 去重
    files_to_process = list(dict.fromkeys(files_to_process))
    
    # 统计
    total_files = len(files_to_process)
    fixed_files = 0
    total_issues = 0
    
    print(f"📋 找到 {total_files} 个文件待处理")
    print("-" * 50)
    
    # 处理每个文件
    for file_path in files_to_process:
        success, issues, messages = fix_markdown_file(file_path, args.dry_run)
        
        total_issues += issues
        if success:
            fixed_files += 1
        
        if args.verbose or success or issues > 0:
            for msg in messages:
                print(msg)
    
    # 总结
    print("-" * 50)
    if args.dry_run:
        print(f"📊 预览完成：发现 {total_issues} 个嵌套问题（未修改文件）")
    else:
        print(f"✅ 处理完成：修复了 {fixed_files}/{total_files} 个文件，共 {total_issues} 个问题")


if __name__ == '__main__':
    main()
