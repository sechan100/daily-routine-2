import { noteRepository, ROUTINE_ARCHIVE_PATH } from "@entities/note";
import { RoutineNoteCreator } from "@entities/routine-to-note/RoutineNoteCreator";
import { Day } from "@shared/period/day";
import { plugin } from "@shared/utils/plugin-service-locator";
import { debounce } from "es-toolkit/compat";
import { TAbstractFile } from "obsidian";
import { useEffect, useRef } from "react";
import { useRoutineNote } from "./use-routine-note";


/**
 * 현재 보고있는 노트 파일이 플러그인 밖(에디터에서 직접 체크, 동기화 등)에서 바뀌면 뷰에 반영한다.
 *
 * 반영하지 않으면 뷰는 오래된 노트를 들고 있다가, 다음 조작 때 그 노트를 통째로 저장하면서 외부 변경을 덮어쓴다.
 * 플러그인 자신의 쓰기도 modify 이벤트를 발생시키지만, 다시 읽은 노트가 현재 노트와 같으면 건너뛰므로 상태가 바뀌지 않는다.
 */
export const useNoteFileSync = () => {
  const note = useRoutineNote(s => s.note);
  const setNote = useRoutineNote(s => s.setNote);
  const noteRef = useRef(note);
  noteRef.current = note;
  const dayFormat = note.day.format();

  useEffect(() => {
    const vault = plugin().app.vault;
    const day = Day.fromString(dayFormat);
    const path = ROUTINE_ARCHIVE_PATH(day);
    let disposed = false;

    const reload = debounce(async () => {
      try {
        // 파일이 지워졌다면 다시 만들지 않고, 루틴으로부터 만든 (저장하지 않은) 노트를 보여준다.
        const loaded = await noteRepository.load(day) ?? (await RoutineNoteCreator.withLoadFromRepositoryAsync()).create(day);
        const current = noteRef.current;
        if(disposed || !current.day.isSameDay(day)) return;
        if(JSON.stringify(current.children) === JSON.stringify(loaded.children)) return;
        setNote(loaded);
      } catch(e) {
        console.error("[Daily Routine] Failed to reload the routine note.", e);
      }
    }, 150);

    const onChange = (file: TAbstractFile) => {
      if(file.path === path) void reload();
    };
    const onRename = (file: TAbstractFile, oldPath: string) => {
      if(file.path === path || oldPath === path) void reload();
    };

    const refs = [
      vault.on("modify", onChange),
      vault.on("create", onChange),
      vault.on("delete", onChange),
      vault.on("rename", onRename),
    ];
    return () => {
      disposed = true;
      reload.cancel();
      refs.forEach(ref => vault.offref(ref));
    };
  }, [dayFormat, setNote]);
}
