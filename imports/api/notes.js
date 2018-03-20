import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';

export const Notes = new Mongo.Collection('notes');

Notes.helpers({
    title() {
        return this.name || this._id;
    },
});

if (Meteor.isServer) {
    import shell from 'shelljs';
    import fs from 'fs';

    Notes.before.insert((userId, doc) => {
        doc.userId = userId;
        doc.createdAt = new Date();
    });

    Notes.before.update((userId, doc, fieldNames, modifier, options) => {
        modifier.$set = modifier.$set || {};
        modifier.$set.userId = userId;
        modifier.$set.updatedAt = new Date();
    });

    const afterUpsert = (userId, doc) => {
        // 사용자별 디렉토리 생성
        let baseDir;
        if (userId) {
            baseDir = `${Meteor.settings.tensorflow.userspace.base}/${userId}`;
        } else {
            baseDir = `${Meteor.settings.tensorflow.userspace.base}/anonymous`;
        }
        shell.mkdir('-p', baseDir);

        // 편집한 파이썬 코드를 파일로 저장
        const filePath = `${baseDir}/${doc.name || doc._id}.py`;
        fs.writeFile(filePath, doc.code, (error) => {
            if (error) throw error;

            // 저장된 파이썬 파일 실행
            if (doc.status === 'running') {
                shell.exec(`python ${filePath} 2>&1`, async (error, stdout, stderr) => {
                    console.log('Exit code:', error);
                    console.log('Program stdout:', stdout);
                    console.log('Program stderr:', stderr);

                    Notes.direct.update(doc._id, {
                        $set: {
                            status: 'saved',
                            result: stdout || stderr,
                        }
                    });
                });
            }
        });
    }

    Notes.after.insert(afterUpsert);
    Notes.after.update(afterUpsert);
}
