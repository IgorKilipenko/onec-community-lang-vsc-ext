import { type GlobOptions, glob } from "glob";
import * as vscode from "vscode";

function fullNameRecursor(word: string, document: vscode.TextDocument, range: vscode.Range, left: boolean) {
  let result: string | null = null;
  let plus: number = 1;
  let newRange: vscode.Range;
  if (left) {
    plus = -1;
    if (range.start.character === 0) {
      return word;
    }
    newRange = new vscode.Range(
      new vscode.Position(range.start.line, range.end.character - word.length + plus),
      new vscode.Position(range.start.line, range.start.character)
    );
  } else {
    newRange = new vscode.Range(
      new vscode.Position(range.end.line, range.end.character),
      new vscode.Position(range.end.line, range.end.character + plus)
    );
  }
  const dot = document.getText(newRange);
  if (dot.endsWith(".")) {
    const getPosition = () => {
      if (left) {
        const leftWordRange = document.getWordRangeAtPosition(newRange.start);
        if (leftWordRange !== undefined) {
          result = document.getText(leftWordRange) + "." + word;
          return leftWordRange !== undefined && leftWordRange.start.character > 1
            ? new vscode.Position(leftWordRange.start.line, leftWordRange.start.character - 1)
            : new vscode.Position(leftWordRange.start.line, 0);
        }
      }
      result = word + "." + document.getText(document.getWordRangeAtPosition(newRange.start));
      return new vscode.Position(newRange.end.line, newRange.end.character + 2);
    };

    const newPosition = getPosition();

    if (document.getText(new vscode.Range(new vscode.Position(newPosition.line, newPosition.character + 1), newPosition)) === ".") {
      const newWord = document.getWordRangeAtPosition(newPosition);
      return document.getText(newWord) + "." + result;
    }
    return result;
  } else {
    return word;
  }
}

